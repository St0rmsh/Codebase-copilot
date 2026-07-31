const ECOSYSTEM_LABELS = {
  npm: "NPM",
  pip: "Python (pip)",
  go: "Go Modules",
  cargo: "Rust (Cargo)",
  nuget: "NuGet (.NET)",
  maven: "Maven (Java)",
};

const TechStackPanel = ({ repo }) => {
  const dependencies = repo?.dependencies || [];

  if (dependencies.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase">
          No dependency manifests found in this repository
        </p>
      </div>
    );
  }

  const grouped = dependencies.reduce((acc, dep) => {
    acc[dep.ecosystem] = acc[dep.ecosystem] || [];
    acc[dep.ecosystem].push(dep);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase mb-6">
        {dependencies.length} dependencies across {Object.keys(grouped).length} ecosystem
        {Object.keys(grouped).length !== 1 ? "s" : ""}
      </p>

      {Object.entries(grouped).map(([ecosystem, deps]) => (
        <div key={ecosystem} className="mb-6">
          <h3 className="font-mono text-sm text-accentSoft tracking-widest2 uppercase mb-3">
            {ECOSYSTEM_LABELS[ecosystem] || ecosystem}
          </h3>
          <div className="border border-border">
            {deps.map((dep, i) => (
              <div
                key={`${dep.name}-${i}`}
                className="flex justify-between items-center px-4 py-2.5 border-b border-border last:border-b-0 bg-panel"
              >
                <span className="font-mono text-xs text-white">{dep.name}</span>
                <span className="font-mono text-xs text-textMuted">{dep.version || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TechStackPanel;