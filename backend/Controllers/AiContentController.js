const {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
  Type,
} = require("@google/genai");

const apiKeyContent =
  process.env.NODE_GEMINI_API_KEY_2 || process.env.NODE_GEMINI_API_KEY;
const configuredModel = process.env.GEMINI_MODEL;

if (!apiKeyContent) {
  console.error("CRITICAL: No Gemini API key is configured for chapter content.");
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
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },

      codeExample: {
        type: Type.STRING,
        description:
          "Optional code snippet. Must be formatted as a string containing HTML <pre><code>...</code></pre> tags. Can be an empty string if not applicable.",
      },
      objectives: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      keyTopics: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      readings: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            url: { type: Type.STRING },
          },
        },
      },
      quiz: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
        },
      },
    },
    required: ["title", "description"],
  },
};

const apiKeyFallback = process.env.NODE_GEMINI_API_KEY;
const fallbackModelName = process.env.GEMINI_FALLBACK_MODEL;

const DISALLOWED_MODELS = new Set([
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemini-2.5-flash",
]);

const CONTENT_MODEL_FALLBACKS = [
  configuredModel,
  "gemini-flash-latest",
  fallbackModelName,
  "gemini-flash-lite-latest",
].filter((model, index, models) =>
  model && !DISALLOWED_MODELS.has(model) && models.indexOf(model) === index,
);

const contentGenerationConfig = {
  responseMimeType: "application/json",
  responseSchema: CHAPTER_CONTENT_SCHEMA,
  temperature: 0.6,
  maxOutputTokens: 4096,
};

const contentSafetySettings = [
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
];

const genAI_Content = apiKeyContent ? new GoogleGenAI({ apiKey: apiKeyContent }) : null;
const genAI_Fallback = apiKeyFallback && apiKeyFallback !== apiKeyContent
  ? new GoogleGenAI({ apiKey: apiKeyFallback })
  : genAI_Content;

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

const isExhaustedQuotaError = (error) => {
  const msg = (error?.message || "").toLowerCase();
  return msg.includes("quota exceeded") || msg.includes("free_tier_requests");
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
async function generateWithRetry(ai, modelName, prompt, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { ...contentGenerationConfig, safetySettings: contentSafetySettings },
      });
    } catch (error) {
      if (
        isExhaustedQuotaError(error) ||
        !isTransientError(error) ||
        attempt === maxRetries
      ) {
        throw error;
      }

      const delay = 2000 * Math.pow(2, attempt);
      console.log(
        `[Content] Gemini transient error (attempt ${attempt + 1}/${maxRetries + 1}). ` +
        `Retrying in ${delay}ms... (${error.message})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Tries each model in CONTENT_MODEL_FALLBACKS with exponential backoff.
 * Uses the primary API key first, then falls back to the secondary key.
 */
async function generateContentWithFallback(prompt) {
  let lastError;
  const genAIInstances = [genAI_Content, genAI_Fallback].filter(
    (instance, index, instances) => instance && instances.indexOf(instance) === index,
  );

  for (const modelName of CONTENT_MODEL_FALLBACKS) {
    for (let keyIndex = 0; keyIndex < genAIInstances.length; keyIndex++) {
      const genAIInstance = genAIInstances[keyIndex];

      try {
        console.log(
          `[Content] Attempting model ${modelName} with API key ${keyIndex + 1}/${genAIInstances.length}`,
        );

        const result = await generateWithRetry(genAIInstance, modelName, prompt, 3);
        console.log(`[Content] Successfully generated with model: ${modelName}`);
        return result;
      } catch (error) {
        lastError = error;
        console.error(
          `[Content] Model ${modelName} with API key ${keyIndex + 1} failed: ${error.message}`,
        );
      }
    }
  }

  throw lastError || new Error("No Gemini model was available for content generation.");
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

    const result = await generateContentWithFallback(message);
    const aiResponseText = result.text;

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
      error: error.message,
    });
  }
}


module.exports = { generateChapterContent };
