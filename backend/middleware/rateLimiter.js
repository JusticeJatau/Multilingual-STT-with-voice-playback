
import { rateLimit } from "express-rate-limit";

export const speechProcessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 audio-processing requests per IP
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many audio processing requests. Please try again later."
  }
});

export const speechGenerateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 voice-generation requests per IP
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many voice generation requests. Please try again later."
  }
});
