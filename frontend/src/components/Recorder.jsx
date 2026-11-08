import { Mic, Pause, Play, RotateCcw, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function Recorder({ audioFile, setAudioFile, duration, setDuration, disabled }) {
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: mimeType });
        setAudioFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setDuration(0);
      setRecording(true);
      timerRef.current = setInterval(() => setDuration((value) => value + 1), 1000);
    } catch {
      alert("Microphone permission is required to record speech.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    clearInterval(timerRef.current);
    setRecording(false);
  }

  function chooseFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    setDuration(0);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function removeAudio() {
    setAudioFile(null);
    setDuration(0);
    setPreviewUrl("");
    if (inputRef.current) inputRef.current.value = "";
  }

  if (audioFile && !recording) {
    return (
      <div className="audio-ready">
        <div className="audio-icon"><Play size={20} fill="currentColor" /></div>
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-sm">{audioFile.name}</strong>
          <span className="text-xs text-[#73827e]">{duration ? formatTime(duration) : "Audio ready to process"}</span>
        </div>
        <audio src={previewUrl} controls className="hidden sm:block sm:w-48" />
        <button type="button" className="icon-button" onClick={removeAudio} aria-label="Remove audio"><X size={18} /></button>
      </div>
    );
  }

  return (
    <div className="recorder-panel">
      <div className={`record-pulse ${recording ? "recording" : ""}`}>
        <Mic size={30} />
      </div>
      <div className="text-center">
        <h3>{recording ? "Listening…" : "Record your speech"}</h3>
        <p>{recording ? formatTime(duration) : "Speak clearly in the selected language"}</p>
      </div>
      <button
        type="button"
        className={`record-button ${recording ? "stop-button" : ""}`}
        onClick={recording ? stopRecording : startRecording}
        disabled={disabled}
      >
        {recording ? <><Pause size={18} fill="currentColor" /> Stop recording</> : <><Mic size={18} /> Start recording</>}
      </button>
      {!recording && (
        <>
          <div className="divider"><span>or</span></div>
          <button type="button" className="upload-button" onClick={() => inputRef.current?.click()} disabled={disabled}>
            <Upload size={17} /> Upload audio file
          </button>
          <input ref={inputRef} type="file" accept="audio/*" onChange={chooseFile} hidden />
        </>
      )}
      {recording && <span className="recording-note"><RotateCcw size={13} /> Maximum recommended length: 5 minutes</span>}
    </div>
  );
}
