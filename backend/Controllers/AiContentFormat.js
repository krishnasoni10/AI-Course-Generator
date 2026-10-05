const {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
  Type,
} = require("@google/genai");

const apiKey = process.env.NODE_GEMINI_API_KEY;
const configuredModel = process.env.GEMINI_MODEL;

if (!apiKey) {
  console.error("CRITICAL: NODE_GEMINI_API_KEY is not set in .env file.");
}

const hasLikelyGeminiApiKey = (key) =>
  typeof key === "string" &&
  (key.trim().startsWith("AIza") || key.trim().startsWith("AQ."));

const COURSE_LAYOUT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    courseName: { type: Type.STRING },
    description: { type: Type.STRING },
    category: { type: Type.STRING },
    topic: { type: Type.STRING },
    level: { type: Type.STRING },
    totalDurationSpecific: { type: Type.STRING },
    totalDurationSummary: { type: Type.STRING },
    chapters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          chapterName: { type: Type.STRING },
          about: { type: Type.STRING },
          duration: { type: Type.STRING },
        },
        required: ["chapterName", "about", "duration"],
      },
    },
  },
  required: [
    "courseName", "description", "category", "topic", "level",
    "totalDurationSpecific", "totalDurationSummary", "chapters",
  ],
};

const fallbackModel = process.env.GEMINI_FALLBACK_MODEL;

const MODEL_FALLBACKS = [
  configuredModel || "gemini-2.0-flash",
  "gemini-2.0-flash",
  fallbackModel || "gemini-1.5-flash",
].filter((model, index, models) =>
  model && models.indexOf(model) === index,
);

const generationConfig = {
  responseMimeType: "application/json",
  responseSchema: COURSE_LAYOUT_SCHEMA,
  temperature: 0.55,
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Determines whether an error is transient (worth retrying).
 * Covers 503 (service unavailable), 429 (rate limit), and generic
 * network/timeout errors that Google's API can throw.
 */
const isTransientError = (error) => {
  const msg = (error?.message || "").toLowerCase();
  const status = error?.status || error?.httpStatusCode || 0;

  return (
    status === 503 ||
    status === 429 ||
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("service unavailable") ||
    msg.includes("unavailable") ||
    msg.includes("overloaded") ||
    msg.includes("resource exhausted") ||
    msg.includes("deadline exceeded") ||
    msg.includes("econnreset") ||
    msg.includes("socket hang up") ||
    msg.includes("etimedout")
  );
};

/**
 * Calls model.generateContent with exponential backoff retry.
 *
 *   Attempt 0  →  fail  →  wait 2 s
 *   Attempt 1  →  fail  →  wait 4 s
 *   Attempt 2  →  fail  →  wait 8 s
 *   Attempt 3  →  fail  →  throw
 *
 * Only transient errors (503, 429, network) trigger a retry.
 * Permanent errors (401, 403, 404) are thrown immediately.
 */
async function generateWithRetry(modelName, prompt, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await genAI.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { ...generationConfig, safetySettings },
      });
    } catch (error) {
      if (!isTransientError(error) || attempt === maxRetries) {
        throw error;
      }

      const delay = 2000 * Math.pow(2, attempt);
      console.log(
        `[Layout] Gemini transient error (attempt ${attempt + 1}/${maxRetries + 1}). ` +
        `Retrying in ${delay}ms... (${error.message})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

const extractJson = (text) => {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI response did not contain JSON.");
    return JSON.parse(jsonMatch[0]);
  }
};

const validateLayout = (layout) => {
  if (!layout || typeof layout !== "object") {
    throw new Error("AI returned an empty course layout.");
  }

  if (!Array.isArray(layout.chapters) || layout.chapters.length === 0) {
    throw new Error("AI returned a course layout without chapters.");
  }

  return {
    courseName: layout.courseName || layout.topic || "Generated Course",
    description: layout.description || "A focused AI-generated course.",
    category: layout.category || "General",
    topic: layout.topic || layout.courseName || "Course Topic",
    level: layout.level || "Beginner",
    totalDurationSpecific: layout.totalDurationSpecific || layout.totalDurationSummary || "Flexible",
    totalDurationSummary: layout.totalDurationSummary || layout.totalDurationSpecific || "Flexible",
    chapters: layout.chapters.map((chapter, index) => ({
      chapterName: chapter.chapterName || chapter.title || `Chapter ${index + 1}`,
      about: chapter.about || chapter.description || "Core concepts and practice for this chapter.",
      duration: chapter.duration || "15 Minutes",
    })),
  };
};

const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Tries each model in MODEL_FALLBACKS with exponential backoff retry.
 *
 *   Primary model (from GEMINI_MODEL or gemini-3.8-flash)
 *       ↓ retry up to 3 times with backoff
 *   Still failing?
 *       ↓
 *   Fallback model (from GEMINI_FALLBACK_MODEL)
 *       ↓ retry up to 3 times with backoff
 *   Still failing?
 *       ↓ throw last error
 */
async function generateWithModelFallback(message) {
  let lastError;

  for (const modelName of MODEL_FALLBACKS) {
    try {
      console.log(`[Layout] Attempting generation with model: ${modelName}`);

      const result = await generateWithRetry(modelName, message, 3);
      const text = result.text;
      const layout = validateLayout(extractJson(text));

      console.log(`[Layout] Successfully generated with model: ${modelName}`);
      return layout;
    } catch (error) {
      lastError = error;
      console.error(
        `[Layout] All attempts failed for model ${modelName}: ${error.message}`
      );
    }
  }

  throw lastError || new Error("No Gemini model was available.");
}

async function generateCourseLayout(req, res) {
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "Server is missing API key configuration.",
    });
  }

  if (!hasLikelyGeminiApiKey(apiKey)) {
    return res.status(401).json({
      success: false,
      message:
        "Gemini API key looks invalid. Use a Google AI Studio key. New auth keys usually start with AQ. and older standard keys usually start with AIza.",
    });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 'message' in request body.",
      });
    }

    const parsed = await generateWithModelFallback(message);

    res.status(200).json({
      success: true,
      data: parsed,
    });

  } catch (error) {
    console.error("Error in generateCourseLayout:", error.message);

    if (error.message?.includes("API key not valid") || error.message?.includes("API_KEY_INVALID")) {
      return res.status(401).json({
        success: false,
        message: "Gemini API key is invalid. Please update NODE_GEMINI_API_KEY.",
      });
    }

    if (error.message?.includes("429")) {
      return res.status(429).json({
        success: false,
        message: "Gemini rate limit reached. Please wait and try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to generate course layout.",
      error: error.message,
    });
  }
}

module.exports = { generateCourseLayout };
