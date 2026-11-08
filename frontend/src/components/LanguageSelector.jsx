import { ArrowLeftRight } from "lucide-react";

const languages = { ha: "Hausa", en: "English" };

export default function LanguageSelector({ source, target, onSwap }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
      <label className="field-label">
        <span>Speaking in</span>
        <div className="language-field">
          <span className="language-code">{source.toUpperCase()}</span>
          <strong>{languages[source]}</strong>
        </div>
      </label>

      <button type="button" className="swap-button" onClick={onSwap} aria-label="Swap languages">
        <ArrowLeftRight size={18} />
      </button>

      <label className="field-label">
        <span>Translate to</span>
        <div className="language-field">
          <span className="language-code">{target.toUpperCase()}</span>
          <strong>{languages[target]}</strong>
        </div>
      </label>
    </div>
  );
}
