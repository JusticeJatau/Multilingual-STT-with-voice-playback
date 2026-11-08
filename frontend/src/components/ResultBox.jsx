import { Check, Copy, LoaderCircle, Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { generateVoice } from "../api/api.js";

export default function ResultBox({ label, language, languageCode, text, accent = false, voiceEnabled = false, onError }) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioUrlRef = useRef("");

  useEffect(() => () => {
    audioRef.current?.pause();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  async function copyText() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function toggleVoice() {
    if (playing) {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }

    try {
      setGenerating(true);
      onError?.("");

      if (!audioRef.current || audioRef.current.dataset.text !== text) {
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        const audioBlob = await generateVoice(text, languageCode);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.dataset.text = text;
        audio.onended = () => setPlaying(false);
        audio.onerror = () => {
          setPlaying(false);
          onError?.("The generated voice could not be played.");
        };
        audioRef.current = audio;
        audioUrlRef.current = audioUrl;
      }

      await audioRef.current.play();
      setPlaying(true);
    } catch (error) {
      onError?.(error.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className={`result-box ${accent ? "result-accent" : ""}`}>
      <div className="result-header">
        <div>
          <span>{label}</span>
          <strong>{language}</strong>
        </div>
        <div className="result-tools">
          {voiceEnabled && (
            <button type="button" className="voice-button" onClick={toggleVoice} disabled={!text || generating}>
              {generating ? <LoaderCircle className="animate-spin" size={16} /> : playing ? <Square size={14} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              {generating ? "Generating…" : playing ? "Stop" : "Play"}
            </button>
          )}
          <button type="button" className="copy-button" onClick={copyText} disabled={!text}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <p className={text ? "" : "placeholder-text"}>{text || "Your result will appear here."}</p>
    </section>
  );
}
