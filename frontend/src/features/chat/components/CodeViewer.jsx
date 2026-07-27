const CodeViewer = ({ chunk }) => {
  if (!chunk) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase">
          Select a citation to view code
        </p>
      </div>
    );
  }

  const lines = chunk.code.split("\n");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border font-mono text-xs text-textMuted">
        <span className="text-accent">JS</span>
        <span>{chunk.filePath.split("/").pop()}</span>
        <span>✕</span>
      </div>

      <div className="flex-1 overflow-auto">
        <pre className="font-mono text-xs leading-6">
          {lines.map((line, i) => {
            const lineNumber = chunk.startLine + i;
            return (
              <div key={i} className="flex hover:bg-panel/50">
                <span className="w-12 text-right pr-4 text-textMuted select-none shrink-0">
                  {lineNumber}
                </span>
                <span className="whitespace-pre">{line}</span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;