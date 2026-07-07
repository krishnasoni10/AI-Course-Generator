const express = require("express");
const CourseModel = require("../Models/CourseModel.js");
const { authenticateToken } = require("../Middlewares/AuthMiddleware.js");

const router = express.Router();

router.use(authenticateToken);

const compactText = (value, maxLength, fallback = "") => {
  const markerPatterns = [
    /_QQ_MARK_\d+[\s\S]*$/i,
    /(?:_#){3,}[\s\S]*$/i,
    /#_#_#_[\s\S]*$/i,
  ];

  let rawText = String(value || "");
  markerPatterns.forEach((pattern) => {
    rawText = rawText.replace(pattern, "");
  });

  const text = rawText
    .replace(/_QQ_MARK_\d+/gi, "")
    .replace(/(?:_#)+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return fallback;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

const normalizeList = (value, maxItems, maxLength) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => compactText(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
};

const normalizeReadings = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((reading) => ({
      title: compactText(reading?.title || reading, 90),
      url: compactText(reading?.url, 220),
    }))
    .filter((reading) => reading.title || reading.url)
    .slice(0, 3);
};

const normalizeQuiz = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const options = normalizeList(item?.options, 4, 90);
      const answer = compactText(item?.answer, 90);
      const matchedAnswer =
        options.find(
          (option) => option.toLowerCase() === answer.toLowerCase(),
        ) || options[0] || "";

      return {
        question: compactText(item?.question, 180),
        options,
        answer: matchedAnswer,
        explanation: compactText(item?.explanation, 180),
      };
    })
    .filter((item) => item.question && item.options.length >= 2)
    .slice(0, 3);
};

router.get("/", async (req, res) => {
  try {
    const filter = { createdBy: req.user.email.toLowerCase() };

    const courses = await CourseModel.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "courseId name category level includeVideo courseOutput createdBy userName createdAt",
      )
      .lean();

    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/save", async (req, res) => {
  try {
    const {
      id,
      topic,
      level,
      category,
      includeVideo,
      courseOutput,
      userName,
      duration,
    } = req.body;

    if (!id || !courseOutput) {
      return res.status(400).json({
        success: false,
        message: "Missing required course data.",
      });
    }

    let userTotalMinutes = 0;
    if (duration) {
      const numericValue = parseInt(duration);
      userTotalMinutes = duration.toLowerCase().includes("hour")
        ? numericValue * 60
        : numericValue;
    } else {
      userTotalMinutes = courseOutput.chapters.length * 15;
    }

    const numChapters = courseOutput.chapters.length;
    const minutesPerChapter = Math.floor(userTotalMinutes / numChapters) || 15;

    const transformedChapters = courseOutput.chapters.map((chapter, index) => {
      let name =
        chapter.chapterName ||
        chapter.chapter_name ||
        chapter.chapterTitle ||
        chapter.title ||
        chapter.name ||
        chapter["Chapter Name"];

      const isIndexBasedName = (name) => {
        if (!name) return true;

        const lower = name.toLowerCase();
        return /^chapter\s*\d+/i.test(lower) || lower.length < 6;
      };

      const generateTitleFromAbout = (about, index) => {
        if (!about) return `Chapter ${index + 1}`;

        const sentence = about.replace(/\n/g, " ").split(".")[0].trim();

        if (sentence.length < 10) {
          return `Chapter ${index + 1}`;
        }

        return sentence.charAt(0).toUpperCase() + sentence.slice(1);
      };
      if (isIndexBasedName(name)) {
        name = generateTitleFromAbout(chapter.about, index);
      }

      let dur = chapter.duration || chapter.Duration;
      if (
        !dur ||
        dur.toLowerCase().includes("0 minute") ||
        dur.toLowerCase() === "n/a"
      ) {
        dur = `${minutesPerChapter} Minutes`;
      }

      return {
        chapterName: name,
        about: chapter.about || chapter.About || "No description provided.",
        duration: dur,
      };
    });

    const transformedCourseOutput = {
      ...courseOutput,
      chapters: transformedChapters,
    };

    let totalDurationSpecific = `${userTotalMinutes} Minutes`;
    if (userTotalMinutes >= 60) {
      const hours = Math.floor(userTotalMinutes / 60);
      const mins = userTotalMinutes % 60;
      totalDurationSpecific = `${hours} Hour${hours > 1 ? "s" : ""}${
        mins > 0 ? ` ${mins} Mins` : ""
      }`;
    }

    transformedCourseOutput.totalDurationSpecific = totalDurationSpecific;
    transformedCourseOutput.totalDurationSummary =
      duration || `${userTotalMinutes} Minutes`;

    const newCourse = new CourseModel({
      courseId: id,
      name:
        courseOutput.courseName ||
        courseOutput.topic ||
        topic ||
        "Untitled Course",

      level,
      category,
      includeVideo,
      courseOutput: transformedCourseOutput,
      createdBy: req.user.email.toLowerCase(),
      userName,
    });

    await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course layout saved successfully!",
      data: newCourse,
    });
  } catch (error) {
    console.error("Error saving course layout:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await CourseModel.findOne({
      courseId: courseId,
      createdBy: req.user.email.toLowerCase(),
    });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.put("/update/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, courseOutput } = req.body;

    const course = await CourseModel.findOne({
      courseId,
      createdBy: req.user.email.toLowerCase(),
    });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (name) {
      course.name = name;
    }

    if (courseOutput) {
      const existingCourseOutput =
        typeof course.courseOutput.toObject === "function"
          ? course.courseOutput.toObject()
          : course.courseOutput;

      course.courseOutput = {
        ...existingCourseOutput,
        ...courseOutput,
      };
      course.markModified("courseOutput");
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully!",
      data: course,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});


router.post("/save-chapter-content", async (req, res) => {
  try {
    const { courseId, chapterName, chapterIndex, textContent, videos = [] } = req.body;

    if (!courseId || !chapterName || !textContent) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required data." });
    }

    const course = await CourseModel.findOne({
      courseId,
      createdBy: req.user.email.toLowerCase(),
    });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    const resolvedChapterIndex =
      Number.isInteger(chapterIndex) &&
      chapterIndex >= 0 &&
      chapterIndex < course.courseOutput.chapters.length
        ? chapterIndex
        : course.courseOutput.chapters.findIndex(
            (chap) => chap.chapterName === chapterName,
          );

    if (resolvedChapterIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found." });
    }
    let contentArray = textContent;

    if (
      typeof textContent === "object" &&
      textContent !== null &&
      !Array.isArray(textContent)
    ) {
      if (textContent.chapterDetails) {
        contentArray = textContent.chapterDetails;
      } else if (textContent.content_blocks) {
        contentArray = textContent.content_blocks;
      } else if (textContent.chapter_details) {
        contentArray = textContent.chapter_details;
      }
    }

    if (!Array.isArray(contentArray)) {
      console.error(
        " Final contentArray is NOT an array. Original data:",
        JSON.stringify(textContent),
      );
      return res.status(400).json({
        success: false,
        message:
          "Invalid format for textContent. Expected an array or a known object wrapper (like chapterDetails or content_blocks).",
      });
    }

    const formattedContent = contentArray.slice(0, 4).map((block) => ({
      title: compactText(block.title, 80, "Untitled Section"),
      description: compactText(
        block.description,
        900,
        "No description provided.",
      ),
      codeExample:
        block.codeExample || block["Code Example"] || block.Code_Example || "",
      objectives: normalizeList(block.objectives || block.Objectives, 4, 110),
      keyTopics: normalizeList(
        block.keyTopics || block.key_topics || block["Key Topics"],
        8,
        50,
      ),
      readings: normalizeReadings(block.readings || block.suggestedReadings),
      quiz: normalizeQuiz(block.quiz || block.mcqs || block.MCQs),
    }));

    if (!Array.isArray(videos)) {
      return res.status(400).json({
        success: false,
        message: "Invalid format for videos. Expected an array.",
      });
    }
    const videoIds = videos
      .map((video) => {
        if (typeof video === "string") return video;
        return video.id?.videoId || video.videoId || "";
      })
      .filter(Boolean);

    course.courseOutput.chapters[resolvedChapterIndex].content = formattedContent;
    course.courseOutput.chapters[resolvedChapterIndex].videos = videoIds;

    course.markModified("courseOutput.chapters");
    await course.save();

    res
      .status(200)
      .json({ success: true, message: "Chapter content saved successfully." });
  } catch (error) {
    console.error(" Error saving chapter content:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
});

module.exports = router;
