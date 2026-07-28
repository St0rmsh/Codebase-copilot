import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchOnboardingDoc } from "../services/repoService";
import { showToast } from "../../../app/toastSlice";
import MarkdownRenderer from "../../../components/MarkdownRenderer";

const OnboardingDocModal = ({ repoId, repoName, onClose }) => {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchOnboardingDoc(repoId)
      .then((data) => setDoc(data.markdown))
      .catch(() => dispatch(showToast("Failed to generate onboarding doc.", "error")))
      .finally(() => setLoading(false));
  }, [repoId]);

  const handleDownload = () => {
    const blob = new Blob([doc], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${repoName}-onboarding.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(doc);
    dispatch(showToast("Copied to clipboard.", "success", 2000));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-panel border border-border w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h2 className="font-mono text-sm tracking-widest2 uppercase text-accentSoft">
            Onboarding Guide
          </h2>
          <button onClick={onClose} className="text-textMuted hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="font-mono text-xs text-textMuted animate-pulse">
              Generating onboarding document...
            </p>
          ) : (
            <MarkdownRenderer content={doc} />
          )}
        </div>

        {!loading && doc && (
          <div className="flex gap-3 px-6 py-4 border-t border-border">
            <button
              onClick={handleDownload}
              className="flex-1 bg-accent hover:bg-accent/90 text-white font-mono text-xs tracking-widest2 uppercase py-3"
            >
              Download .md
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 border border-border hover:border-white/50 text-white font-mono text-xs tracking-widest2 uppercase py-3"
            >
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingDocModal;