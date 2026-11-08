import mongoose from "mongoose";
import Translation from "../models/Translation.js";
import {
  generateSpeechWithGemini,
  getDemoResult,
  processAudioWithGemini
} from "../services/geminiService.js";

const memoryHistory = [];
const isDatabaseReady = () => mongoose.connection.readyState === 1;

export async function processSpeech(req, res) {
  try {
    const { sourceLanguage, targetLanguage, duration = 0 } = req.body;

    if (!req.file) return res.status(400).json({ message: "Please record or upload an audio file." });
    if (!["ha", "en"].includes(sourceLanguage) || !["ha", "en"].includes(targetLanguage)) {
      return res.status(400).json({ message: "Please select supported source and target languages." });
    }
    if (sourceLanguage === targetLanguage) {
      return res.status(400).json({ message: "Source and target languages must be different." });
    }

    const demoMode = process.env.DEMO_MODE === "true" || !process.env.GEMINI_API_KEY;
    const result = demoMode
      ? getDemoResult(sourceLanguage)
      : await processAudioWithGemini(req.file, sourceLanguage, targetLanguage);

    if (!result.transcript || !result.translation) {
      return res.status(422).json({ message: "Speech was not clear enough to transcribe. Please try again." });
    }

    return res.json({
      ...result,
      sourceLanguage,
      targetLanguage,
      audioName: req.file.originalname || "Recorded audio",
      duration: Number(duration) || 0,
      demoMode
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Audio processing failed." });
  }
}

export async function saveTranslation(req, res) {
  try {
    const item = {
      sourceLanguage: req.body.sourceLanguage,
      targetLanguage: req.body.targetLanguage,
      transcript: req.body.transcript,
      translation: req.body.translation,
      audioName: req.body.audioName,
      duration: Number(req.body.duration) || 0
    };

    if (!item.transcript || !item.translation) {
      return res.status(400).json({ message: "There is no result to save." });
    }

    if (isDatabaseReady()) {
      const saved = await Translation.create(item);
      return res.status(201).json(saved);
    }

    const saved = { ...item, _id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    memoryHistory.unshift(saved);
    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ message: "Could not save this translation." });
  }
}

export async function getHistory(req, res) {
  const history = isDatabaseReady()
    ? await Translation.find().sort({ createdAt: -1 }).lean()
    : memoryHistory;
  return res.json(history);
}

export async function deleteHistoryItem(req, res) {
  if (isDatabaseReady()) {
    await Translation.findByIdAndDelete(req.params.id);
  } else {
    const index = memoryHistory.findIndex((item) => item._id === req.params.id);
    if (index >= 0) memoryHistory.splice(index, 1);
  }
  return res.status(204).send();
}

export async function clearHistory(req, res) {
  if (isDatabaseReady()) await Translation.deleteMany({});
  else memoryHistory.splice(0, memoryHistory.length);
  return res.status(204).send();
}

export async function generateSpeech(req, res) {
  try {
    const { text, language } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "There is no translated text to read." });
    }
    if (!["ha", "en"].includes(language)) {
      return res.status(400).json({ message: "The selected voice language is not supported." });
    }
    if (text.length > 5000) {
      return res.status(400).json({ message: "The translated text is too long for voice output." });
    }

    const audio = await generateSpeechWithGemini(text.trim(), language);
    res.set({
      "Content-Type": "audio/wav",
      "Content-Length": audio.length,
      "Cache-Control": "no-store"
    });
    return res.send(audio);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Voice generation failed." });
  }
}
