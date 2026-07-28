import { useState } from "react";
import { useRepos } from "../hooks/useRepos";
import Button from "../../../components/Button";

const MultiRepoSelector = ({ onStart }) => {
  const { repos, loading } = useRepos();
  const [selected, setSelected] = useState([]);

  const indexedRepos = repos.filter((r) => r.status === "indexed");

  const toggle = (repoId) => {
    setSelected((prev) =>
      prev.includes(repoId) ? prev.filter((id) => id !== repoId) : [...prev, repoId]
    );
  };

  return (
    <div className="max-w-xl mx-auto mt-16">
      <h2 className="font-display text-2xl uppercase text-center mb-2">Compare Repositories</h2>
      <p className="font-mono text-xs text-textMuted text-center tracking-widest2 uppercase mb-8">
        Select 2 or more indexed repos to cross-reference
      </p>

      {loading ? (
        <p className="font-mono text-xs text-textMuted text-center">Loading repositories...</p>
      ) : indexedRepos.length < 2 ? (
        <p className="font-mono text-xs text-textMuted text-center">
          You need at least 2 indexed repositories to use this feature.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2 mb-8">
            {indexedRepos.map((repo) => (
              <button
                key={repo._id}
                onClick={() => toggle(repo._id)}
                className={`flex justify-between items-center px-4 py-3 border font-mono text-xs transition ${
                  selected.includes(repo._id)
                    ? "border-accent bg-panel text-accent"
                    : "border-border text-textMuted hover:text-white"
                }`}
              >
                <span>{repo.fullName}</span>
                {selected.includes(repo._id) && <span>✓</span>}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            className="w-full"
            disabled={selected.length < 2}
            onClick={() => onStart(selected)}
          >
            Start Comparison ({selected.length} selected)
          </Button>
        </>
      )}
    </div>
  );
};

export default MultiRepoSelector;