import express from "express";
import multer from "multer";
import {
  clearHistory,
  deleteHistoryItem,
  generateSpeech,
  getHistory,
  processSpeech,
  saveTranslation
} from "../controllers/speechController.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith("audio/")) callback(null, true);
    else callback(new Error("Only audio files are allowed."));
  }
});

router.post("/speech/process", upload.single("audio"), processSpeech);
router.post("/speech/generate", generateSpeech);
router.post("/history", saveTranslation);
router.get("/history", getHistory);
router.delete("/history/:id", deleteHistoryItem);
router.delete("/history", clearHistory);

export default router;
