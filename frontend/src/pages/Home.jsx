import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle, Save, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { processAudio, saveResult } from "../api/api.js";
import LanguageSelector from "../components/LanguageSelector.jsx";
import Recorder from "../components/Recorder.jsx";
import ResultBox from "../components/ResultBox.jsx";

const languageNames = { ha: "Hausa", en: "English" };

export default function Home() {
  const [source, setSource] = useState("ha");
  const [target, setTarget] = useState("en");
  const [audioFile, setAudioFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function swapLanguages() {
    setSource(target);
    setTarget(source);
    setResult(null);
    setSaved(false);
  }

  async function handleProcess() {
    if (!audioFile) return setError("Record your voice or upload an audio file first.");
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("sourceLanguage", source);
      formData.append("targetLanguage", target);
      formData.append("duration", duration);
      setResult(await processAudio(formData));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result || saved) return;
    setSaving(true);
    try {
      await saveResult(result);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function clearWorkspace() {
    setAudioFile(null);
    setDuration(0);
    setResult(null);
    setSaved(false);
    setError("");
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="eyebrow"><Sparkles size={14} /> AI speech translation</span>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Speak naturally. Understand clearly.</h1>
          <p className="mt-3 max-w-2xl text-[#61706c]">Turn Hausa or English speech into written text and translate it in one simple step.</p>
        </div>
        <div className="status-pill"><span /> Ready to listen</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="workspace-card p-5 sm:p-7">
          <div className="section-heading">
            <div><span>01</span><div><h2>Choose languages</h2><p>Select what you will speak and the translation you need.</p></div></div>
          </div>
          <LanguageSelector source={source} target={target} onSwap={swapLanguages} />

          <div className="my-7 h-px bg-[#e3e9e6]" />

          <div className="section-heading">
            <div><span>02</span><div><h2>Add your voice</h2><p>Record directly or choose an existing audio file.</p></div></div>
          </div>
          <Recorder
            audioFile={audioFile}
            setAudioFile={setAudioFile}
            duration={duration}
            setDuration={setDuration}
            disabled={loading}
          />

          {error && <div className="error-message"><AlertCircle size={17} /> {error}</div>}

          <button type="button" className="process-button" onClick={handleProcess} disabled={!audioFile || loading}>
            {loading ? <><LoaderCircle className="animate-spin" size={19} /> Processing speech…</> : <>Transcribe & translate <ArrowRight size={19} /></>}
          </button>
          <p className="privacy-note">Your audio is processed securely and is not stored permanently.</p>
        </section>

        <section className="workspace-card overflow-hidden">
          <div className="results-title">
            <div><span>03</span><div><h2>Your result</h2><p>Review the transcript and translated text.</p></div></div>
            {result?.demoMode && <span className="demo-badge">Demo result</span>}
          </div>
          <div className="grid gap-4 p-5 sm:p-7">
            <ResultBox label="Original transcript" language={languageNames[source]} languageCode={source} text={result?.transcript} />
            <ResultBox
              label="Translation"
              language={languageNames[target]}
              languageCode={target}
              text={result?.translation}
              accent
              voiceEnabled
              onError={setError}
            />
          </div>
          <div className="result-actions">
            <button type="button" className="secondary-button" onClick={clearWorkspace} disabled={!audioFile && !result}>
              <Trash2 size={17} /> Clear
            </button>
            <button type="button" className="save-button" onClick={handleSave} disabled={!result || saving || saved}>
              {saved ? <CheckCircle2 size={17} /> : <Save size={17} />}
              {saved ? "Saved to history" : saving ? "Saving…" : "Save result"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
