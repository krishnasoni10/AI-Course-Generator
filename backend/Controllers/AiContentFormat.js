const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  SchemaType,
} = require("@google/generative-ai");

const apiKey = process.env.NODE_GEMINI_API_KEY;
const configuredModel = process.env.GEMINI_MODEL;

if (!apiKey) {
  console.error("CRITICAL: NODE_GEMINI_API_KEY is not set in .env file.");
}

const hasLikelyGeminiApiKey = (key) =>
  typeof key === "string" &&
  (key.trim().startsWith("AIza") || key.trim().startsWith("AQ."));

const COURSE_LAYOUT_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    courseName: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
    category: { type: SchemaType.STRING },
    topic: { type: SchemaType.STRING },
    level: { type: SchemaType.STRING },
    totalDurationSpecific: { type: SchemaType.STRING },
    totalDurationSummary: { type: SchemaType.STRING },
    chapters: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          chapterName: { type: SchemaType.STRING },
          about: { type: SchemaType.STRING },
          duration: { type: SchemaType.STRING },
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

const MODEL_FALLBACKS = [
  configuredModel,
  "gemini-1.5-flash",
  "gemini-2.0-flash",
].filter(Boolean);

const generationConfig = {
  responseMimeType: "application/json",
  responseSchema: COURSE_LAYOUT_SCHEMA,
  temperature: 0.55,
  maxOutputTokens: 1600,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

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

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

async function generateWithModelFallback(message) {
  let lastError;

  for (const modelName of MODEL_FALLBACKS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig,
        safetySettings,
      });

      const result = await model.generateContent(message);
      const text = result.response.text();
      return validateLayout(extractJson(text));
    } catch (error) {
      lastError = error;
      console.error(`Course layout generation failed with ${modelName}:`, error.message);
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
