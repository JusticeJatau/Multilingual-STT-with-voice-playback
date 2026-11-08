const languageNames = { ha: "Hausa", en: "English" };

const DEFAULT_TRANSCRIPTION_FALLBACKS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash"
];

function cleanJson(text) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function getModelList(primaryModel, fallbackModels) {
  return [...new Set([primaryModel, ...fallbackModels].filter(Boolean))];
}

function getFallbackModels() {
  const configuredModels = process.env.GEMINI_FALLBACK_MODELS;

  if (configuredModels) {
    return configuredModels
      .split(",")
      .map((model) => model.trim())
      .filter(Boolean);
  }

  return DEFAULT_TRANSCRIPTION_FALLBACKS;
}

/**
 * Tries each model in order.
 * Switches to the next model if the current one fails.
 */
async function generateWithModelFallback({
  primaryModel,
  fallbackModels,
  apiKey,
  requestBody,
}) {
  const models = getModelList(primaryModel, fallbackModels);
  let lastError;

  for (const model of models) {
    try {
      console.log(`[Gemini] Trying model: ${model}`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(
          data.error?.message ||
            `Gemini request failed with status ${response.status}.`
        );

        error.status = response.status;
        throw error;
      }

      const resultText = data.candidates
        ?.find((candidate) => candidate.content?.parts?.some(
          (part) => typeof part.text === "string"
        ))
        ?.content?.parts?.find(
          (part) => typeof part.text === "string"
        )?.text;

      if (!resultText) {
        throw new Error("No usable response was returned by this model.");
      }

      console.log(`[Gemini] Successful model: ${model}`);

      return {
        resultText,
        model,
      };
    } catch (error) {
      lastError = error;

      console.error(
        `[Gemini] Model ${model} failed: ${error.message}`
      );

      if (model !== models[models.length - 1]) {
        console.log("[Gemini] Switching to the next fallback model...");
      }
    }
  }

  throw new Error(
    `All Gemini models failed. Last error: ${
      lastError?.message || "Unknown error"
    }`
  );
}

export async function processAudioWithGemini(
  file,
  sourceLanguage,
  targetLanguage
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  if (!languageNames[sourceLanguage] || !languageNames[targetLanguage]) {
    throw new Error("Unsupported source or target language.");
  }

  const primaryModel =
    process.env.GEMINI_MODEL || "gemini-3.6-flash";

  const fallbackModels = getFallbackModels();

  const prompt = `Listen carefully to this audio. The speaker is expected to use ${languageNames[sourceLanguage]}. Return only valid JSON with two string fields: transcript and translation. The transcript must preserve exactly what was spoken in ${languageNames[sourceLanguage]}, with normal punctuation. The translation must accurately express the same meaning in ${languageNames[targetLanguage]}. Do not explain your answer. If speech cannot be understood, use an empty string for both fields.`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: file.mimetype,
              data: file.buffer.toString("base64"),
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          transcript: { type: "STRING" },
          translation: { type: "STRING" },
        },
        required: ["transcript", "translation"],
      },
    },
  };

  const { resultText, model } = await generateWithModelFallback({
    primaryModel,
    fallbackModels,
    apiKey,
    requestBody,
  });

  let result;

  try {
    result = JSON.parse(cleanJson(resultText));
  } catch {
    throw new Error(
      `Gemini model ${model} returned invalid JSON.`
    );
  }

  if (
    typeof result.transcript !== "string" ||
    typeof result.translation !== "string"
  ) {
    throw new Error(
      `Gemini model ${model} returned an invalid transcript or translation.`
    );
  }

  return result;
}

function createWavBuffer(
  pcmBuffer,
  sampleRate = 24000,
  channels = 1,
  bitsPerSample = 16
) {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]);
}

export async function generateSpeechWithGemini(text, language) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const model =
    process.env.GEMINI_TTS_MODEL ||
    "gemini-3.1-flash-tts-preview";

  const voice = process.env.GEMINI_TTS_VOICE || "Kore";
  const languageName =
    languageNames[language] || "the detected language";

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/interactions",
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: `Read the following ${languageName} translation naturally and clearly. Say only the provided text:\n\n${text}`,
        response_format: { type: "audio" },
        generation_config: {
          speech_config: [{ voice }],
        },
      }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
        "Gemini could not generate the voice output."
    );
  }

  const audioContent = data.steps
    ?.filter((step) => step.type === "model_output")
    .flatMap((step) => step.content || [])
    .find(
      (content) => content.type === "audio" && content.data
    );

  if (!audioContent?.data) {
    throw new Error(
      `Gemini returned no voice audio. Status: ${
        data.status || "unknown"
      }`
    );
  }

  const pcmBuffer = Buffer.from(audioContent.data, "base64");

  return createWavBuffer(
    pcmBuffer,
    audioContent.sample_rate || 24000,
    audioContent.channels || 1
  );
}

export function getDemoResult(sourceLanguage) {
  if (sourceLanguage === "ha") {
    return {
      transcript: "Ina son zuwa makaranta gobe da safe.",
      translation: "I want to go to school tomorrow morning.",
    };
  }

  return {
    transcript: "Learning becomes easier when knowledge is shared.",
    translation: "Koyo yana zama mai sauƙi idan ana raba ilimi.",
  };
}