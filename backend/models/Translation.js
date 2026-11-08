import mongoose from "mongoose";

const translationSchema = new mongoose.Schema(
  {
    sourceLanguage: { type: String, enum: ["ha", "en"], required: true },
    targetLanguage: { type: String, enum: ["ha", "en"], required: true },
    transcript: { type: String, required: true, trim: true },
    translation: { type: String, required: true, trim: true },
    audioName: { type: String, trim: true, default: "Recorded audio" },
    duration: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Translation", translationSchema);
