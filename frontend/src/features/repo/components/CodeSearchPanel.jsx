import { useState } from "react";
import { searchRepoCode } from "../services/repoService";

const CodeSearchPanel = ({ repoId, onResultClick }) => {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchRepoCode(repoId, query.trim());
      setMatches(data.matches);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <form onSubmit={handleSubmit} className="flex gap-2 px-6 py-3 border-b border-border">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exact text (e.g. function name, variable, string)..."
          className="flex-1 bg-transparent border border-border px-3 py-2 font-mono text-xs placeholder:text-textMuted focus:border-accent outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-mono text-xs tracking-widest2 uppercase px-4"
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto">
        {!searched ? (
          <p className="font-mono text-xs text-textMuted p-6">
            Search for exact text across all indexed code in this repository.
          </p>
        ) : loading ? (
          <p className="font-mono text-xs text-textMuted animate-pulse p-6">Searching...</p>
        ) : matches.length === 0 ? (
          <p className="font-mono text-xs text-textMuted p-6">No matches found.</p>
        ) : (
          <div className="divide-y divide-border">
            {matches.map((m, i) => (
              <button
                key={i}
                onClick={() => onResultClick(m)}
                className="w-full text-left px-6 py-3 hover:bg-panel transition"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs text-accentSoft truncate">{m.filePath}</span>
                  <span className="font-mono text-xs text-textMuted shrink-0 ml-2">
                    :{m.lineNumber}
                  </span>
                </div>
                <p className="font-mono text-xs text-textMuted truncate">{m.lineContent}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeSearchPanel;