import { ArrowRight, Clock3, Languages, LoaderCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { clearAllHistory, deleteHistoryItem, getHistory } from "../api/api.js";

const names = { ha: "Hausa", en: "English" };

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHistory().then(setItems).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  async function removeItem(id) {
    await deleteHistoryItem(id);
    setItems((current) => current.filter((item) => item._id !== id));
  }

  async function clearHistory() {
    if (!window.confirm("Clear every saved translation?")) return;
    await clearAllHistory();
    setItems([]);
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8 lg:py-12">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <span className="eyebrow"><Clock3 size={14} /> Saved translations</span>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Translation history</h1>
          <p className="mt-2 text-[#61706c]">Return to useful transcripts whenever you need them.</p>
        </div>
        {items.length > 0 && <button className="secondary-button" onClick={clearHistory}><Trash2 size={16} /> Clear all</button>}
      </div>

      {loading && <div className="empty-state"><LoaderCircle className="animate-spin" /><p>Loading history…</p></div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="empty-state"><Languages size={34} /><h2>No saved translations yet</h2><p>Results you save from the translation workspace will appear here.</p></div>
      )}

      <div className="grid gap-4">
        {items.map((item) => (
          <article className="history-card" key={item._id}>
            <div className="history-meta">
              <span>{names[item.sourceLanguage]} <ArrowRight size={13} /> {names[item.targetLanguage]}</span>
              <time>{new Date(item.createdAt).toLocaleString()}</time>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div><small>Original</small><p>{item.transcript}</p></div>
              <div className="translated-history"><small>Translation</small><p>{item.translation}</p></div>
            </div>
            <button className="delete-item" onClick={() => removeItem(item._id)} aria-label="Delete translation"><Trash2 size={16} /></button>
          </article>
        ))}
      </div>
    </div>
  );
}
