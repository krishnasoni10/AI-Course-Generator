const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  SchemaType,
} = require("@google/generative-ai");

const apiKeyContent = process.env.NODE_GEMINI_API_KEY_2;
const configuredModel = process.env.GEMINI_MODEL;

if (!apiKeyContent) {
  console.error("CRITICAL: NODE_GEMINI_API_KEY_2 is not set in .env file.");
}

const hasLikelyGeminiApiKey = (key) =>
  typeof key === "string" &&
  (key.trim().startsWith("AIza") || key.trim().startsWith("AQ."));

const sanitizeGeneratedText = (value = "", maxLength = 240, fallback = "") => {
  const markerPatterns = [
    /_QQ_MARK_\d+[\s\S]*$/i,
    /(?:_#){3,}[\s\S]*$/i,
    /#_#_#_[\s\S]*$/i,
  ];

  let text = String(value || "");
  markerPatterns.forEach((pattern) => {
    text = text.replace(pattern, "");
  });

  text = text
    .replace(/_QQ_MARK_\d+/gi, "")
    .replace(/(?:_#)+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return fallback;
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
};

const normalizeList = (value, maxItems, maxLength) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitizeGeneratedText(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
};

const normalizeQuiz = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const question = sanitizeGeneratedText(item?.question, 140);
      const options = normalizeList(item?.options, 4, 60);
      const answer = sanitizeGeneratedText(item?.answer, 60);
      const matchedAnswer =
        options.find(
          (option) => option.toLowerCase() === answer.toLowerCase(),
        ) || options[0] || "";

      return {
        question,
        options,
        answer: matchedAnswer,
        explanation: sanitizeGeneratedText(item?.explanation, 120),
      };
    })
    .filter((item) => item.question && item.options.length === 4 && item.answer)
    .slice(0, 3);
};

const normalizeChapterContent = (value) => {
  if (!Array.isArray(value)) return [];

  let quizCount = 0;
  return value.slice(0, 4).map((block, index) => {
    const remainingQuizSlots = Math.max(0, 3 - quizCount);
    const quiz = normalizeQuiz(block.quiz || block.mcqs || block.MCQs).slice(
      0,
      remainingQuizSlots,
    );
    quizCount += quiz.length;

    return {
      title: sanitizeGeneratedText(
        block.title,
        70,
        `Section ${index + 1}`,
      ),
      description: sanitizeGeneratedText(
        block.description,
        900,
        "No description provided.",
      ),
      codeExample: sanitizeGeneratedText(
        block.codeExample || block["Code Example"] || block.Code_Example || "",
        1600,
      ),
      objectives: normalizeList(block.objectives || block.Objectives, 4, 90),
      keyTopics: normalizeList(
        block.keyTopics || block.key_topics || block["Key Topics"],
        6,
        45,
      ),
      readings: Array.isArray(block.readings || block.suggestedReadings)
        ? (block.readings || block.suggestedReadings).slice(0, 3).map((reading) => ({
            title: sanitizeGeneratedText(reading?.title || reading, 80),
            url: sanitizeGeneratedText(reading?.url, 220),
          }))
        : [],
      quiz,
    };
  });
};

const CHAPTER_CONTENT_SCHEMA = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING },
      description: { type: SchemaType.STRING },

      codeExample: {
        type: SchemaType.STRING,
        description:
          "Optional code snippet. Must be formatted as a string containing HTML <pre><code>...</code></pre> tags. Can be an empty string if not applicable.",
      },
      objectives: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
      keyTopics: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
      readings: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            url: { type: SchemaType.STRING },
          },
        },
      },
      quiz: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            question: { type: SchemaType.STRING },
            options: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            answer: { type: SchemaType.STRING },
            explanation: { type: SchemaType.STRING },
          },
        },
      },
    },
    required: ["title", "description"],
  },
};

const genAI_Content = new GoogleGenerativeAI(apiKeyContent);
const contentModel = genAI_Content.getGenerativeModel({
  model: configuredModel || "gemini-1.5-flash",

  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: CHAPTER_CONTENT_SCHEMA,
    temperature: 0.6,
    maxOutputTokens: 1800,
  },

  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});
async function generateWithRetry(prompt, retries = 2, delay = 1500) {
  try {
    return await contentModel.generateContent(prompt);
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((res) => setTimeout(res, delay));
    return generateWithRetry(prompt, retries - 1, delay * 1.5);
  }
}

async function generateChapterContent(req, res) {
  if (!apiKeyContent) {
    return res.status(500).json({
      success: false,
      message: "Server is missing API key configuration for content.",
    });
  }

  if (!hasLikelyGeminiApiKey(apiKeyContent)) {
    return res.status(401).json({
      success: false,
      message:
        "Gemini content API key looks invalid. Use a Google AI Studio key. New auth keys usually start with AQ. and older standard keys usually start with AIza.",
    });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 'message'.",
      });
    }

    const result = await generateWithRetry(message);
    const response = result.response;
    const aiResponseText = response.text();

    let parsed;
    try {
      parsed = JSON.parse(aiResponseText);
    } catch (e) {
      console.error("Invalid JSON from AI:", aiResponseText);
      return res.status(502).json({
        success: false,
        message: "AI returned invalid structured data. Please retry.",
      });
    }

    return res.status(200).json({
      success: true,
      data: normalizeChapterContent(parsed),
    });

  } catch (error) {
    console.error("Error in generateChapterContent:", error.message);

    if (error.message?.includes("429")) {
      return res.status(429).json({
        success: false,
        message: "AI rate limit exceeded. Please wait and retry.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate chapter content.",
    });
  }
}


module.exports = { generateChapterContent };
