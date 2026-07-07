import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CourseBasicInfo from "./_components/CourseBasicInfo";
import CourseDetail from "./_components/CourseDetail";
import ChapterList from "./_components/ChapterList";
import { Button } from "@/components/ui/button";
import LoadingDialog from "../_components/LoadingDialog";
import { CheckCircle2, Clock3, Loader2, Sparkles, Video } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function CourseLayout() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChapterLoading, setIsChapterLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    current: "",
    completed: 0,
    total: 0,
    failed: [],
  });
  const fetchCourse = useCallback(async () => {
    try {
      const data = await apiFetch(`/course/${courseId}`);
      if (data.success) {
        setCourse(data.data);
      } else {
        toast.error(data.message || "Course not found.");
      }
    } catch (error) {
      toast.error(error.message || "Error fetching course.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId, fetchCourse]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-10 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        Loading course...
      </div>
    );
  }
  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 p-10 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        Course not found.
      </div>
    );
  }

  /**
   * @param {object} chapter
   */

  const generateChapterContent = async (chapter, index) => {
    const courseName = course?.courseOutput?.courseName;
    const chapterName = chapter.chapterName;

    try {
      const textPrompt = `
Create compact, engaging study material for:
Course: "${courseName}"
Chapter: "${chapterName}"

Return only JSON matching the schema.
Rules:
- Write in clear, simple English with short, readable sentences.
- Create 2 to 3 content sections only.
- Each section title must be under 8 words.
- Each description must be 60 to 100 words, not a keyword dump.
- Include 3 clear objectives and 4 to 6 keyTopics.
- Include codeExample only when genuinely useful.
- Include 2 quiz questions total across the response.
- Each quiz question must be under 140 characters.
- Each quiz must have exactly 4 short options.
- The answer must exactly match one option string.
- Explanation must be 1 short sentence.
- Do not write paragraph-style quiz questions.
- Never use placeholders, repeated symbols, filler tokens, _QQ_MARK, or #_# patterns.
- If unsure, return a shorter valid quiz instead of long text.
`;

      const videoQuery = `${courseName} ${chapterName} tutorial`;

      const textPromise = apiFetch("/ai/generate-chapter", {
        method: "POST",
        body: JSON.stringify({ message: textPrompt }),
      });

      const videoPromise = course?.includeVideo
        ? apiFetch(`/ai/get-videos?q=${encodeURIComponent(videoQuery)}`)
        : Promise.resolve({ success: true, data: [] });

      const textData = await textPromise;
      let videoWarning = "";
      let videoData = { success: true, data: [] };

      try {
        videoData = await videoPromise;
      } catch (error) {
        videoWarning = `Video search skipped for ${chapterName}: ${error.message}`;
      }

      if (textData.success) {
        const savePayload = {
          courseId,
          chapterName,
          chapterIndex: index,
          textContent: textData.data,
          videos: videoData.success ? videoData.data : [],
        };

        await apiFetch("/course/save-chapter-content", {
          method: "POST",
          body: JSON.stringify(savePayload),
        });

        return { videoWarning };
      }

      throw new Error("AI returned no chapter content.");
    } catch (error) {
      throw new Error(`${chapterName}: ${error.message}`);
    }
  };

  const GenerateAllChapterContent = async () => {
    setIsChapterLoading(true);

    const chapters = course?.courseOutput?.chapters;
    if (!chapters) {
      console.error("No chapters found in course.");
      setIsChapterLoading(false);
      return;
    }

    const pendingChapters = chapters
      .map((chapter, index) => ({ chapter, index }))
      .filter(({ chapter }) => !chapter.content || chapter.content.length === 0);

    if (pendingChapters.length === 0) {
      setIsChapterLoading(false);
      toast.info("Lessons are already generated for this course.");
      return;
    }

    setGenerationProgress({
      current: "",
      completed: 0,
      total: pendingChapters.length,
      failed: [],
    });

    const failures = [];

    const runChapter = async ({ chapter, index }) => {
        setGenerationProgress((prev) => ({
          ...prev,
          current: chapter.chapterName,
        }));

        try {
          const result = await generateChapterContent(chapter, index);
          setGenerationProgress((prev) => ({
            ...prev,
            completed: prev.completed + 1,
            failed: result?.videoWarning
              ? [...prev.failed, result.videoWarning]
              : prev.failed,
          }));
        } catch (error) {
          failures.push(error.message);
          setGenerationProgress((prev) => ({
            ...prev,
            completed: prev.completed + 1,
            failed: [...prev.failed, error.message],
          }));
        }

        await sleep(300);
    };

    for (let i = 0; i < pendingChapters.length; i += 3) {
      await Promise.all(pendingChapters.slice(i, i + 3).map(runChapter));
    }

    await fetchCourse();
    setIsChapterLoading(false);
    setGenerationProgress((prev) => ({ ...prev, current: "" }));
    if (failures.length > 0) {
      toast.warning("Chapter generation finished with some warnings.");
    } else {
      toast.success("Chapter generation finished.");
    }
  };
  return (
    <div className="min-h-[calc(100vh-88px)] rounded-3xl bg-[radial-gradient(circle_at_top_left,#e0f2fe,transparent_30%),linear-gradient(180deg,#ffffff,#f8fafc)] px-5 py-10 text-slate-950 transition-colors dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.10),transparent_32%),linear-gradient(180deg,#030712,#0f172a_55%,#020617)] dark:text-white md:px-16 lg:px-28">
      <LoadingDialog
        loading={isChapterLoading}
        title="Building your study material"
        description="Generating notes, quizzes, readings, and video suggestions. You can relax here - progress is being saved chapter by chapter."
        progress={{
          percent:
            generationProgress.total > 0
              ? Math.round(
                  (generationProgress.completed /
                    generationProgress.total) *
                    100,
                )
              : 0,
          label: generationProgress.current
            ? `Working on: ${generationProgress.current}`
            : "Preparing chapters...",
        }}
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-teal-300/10 dark:bg-slate-900/80 dark:shadow-[0_0_34px_rgba(45,212,191,0.07)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-800 dark:bg-teal-300/10 dark:text-teal-200">
                <Sparkles className="h-4 w-4" />
                AI course studio
              </div>
              <h2 className="text-3xl font-black text-slate-950 dark:text-white md:text-5xl">
                Shape the outline, then generate the lessons.
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
                Your plan is ready. Generate chapter notes and video resources
                before starting the course.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 dark:bg-slate-950/70">
                  <Clock3 className="h-4 w-4 text-teal-500" />
                  Faster compact lessons
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 dark:bg-slate-950/70">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Saves progress after each chapter
                </span>
              </div>
            </div>
            <Button
              onClick={GenerateAllChapterContent}
              disabled={isChapterLoading}
              className="h-12 rounded-xl bg-slate-950 px-6 text-base font-bold text-white hover:bg-slate-800 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-teal-200"
            >
              {isChapterLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Video className="h-5 w-5" />
              )}
              {isChapterLoading ? "Generating..." : "Generate Lessons"}
            </Button>
          </div>
        </div>

        <CourseBasicInfo course={course} onCourseUpdated={fetchCourse} />
        <CourseDetail course={course} />
        <ChapterList course={course} onCourseUpdated={fetchCourse} />

        {isChapterLoading && (
          <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-950 shadow-sm dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-100">
            <p className="font-semibold">
              Creating study content: {generationProgress.completed} of{" "}
              {generationProgress.total} chapters
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white dark:bg-white/10">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{
                  width: `${
                    generationProgress.total
                      ? (generationProgress.completed /
                          generationProgress.total) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
            {generationProgress.current && (
              <p className="mt-3">Current: {generationProgress.current}</p>
            )}
            {generationProgress.failed.length > 0 && (
              <p className="mt-2 text-red-600 dark:text-red-300">
                Warnings: {generationProgress.failed.length}. Missing videos can
                be retried later; notes are still saved.
              </p>
            )}
          </div>
        )}

        {!isChapterLoading && generationProgress.completed > 0 && (
          <div className="my-8 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-200">
            <CheckCircle2 className="h-5 w-5" />
            Content generation finished. Open Start to study the course.
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseLayout;
