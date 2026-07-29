const statusColors = {
  indexed: "text-accentSoft",
  pending: "text-textMuted",
  cloning: "text-accent",
  failed: "text-accent",
};

const IndexingRow = ({ repo }) => {
  return (
    <div className="grid grid-cols-6 gap-4 items-center px-4 py-3 border-b border-border font-mono text-xs">
      <span className="col-span-2 truncate text-white">{repo.fullName}</span>
      <span className={statusColors[repo.status] || "text-textMuted"}>{repo.status.toUpperCase()}</span>
      <span className="text-textMuted">{repo.fileCount} files</span>
      <span className="text-textMuted">{repo.embeddedChunks}/{repo.totalChunks} chunks</span>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-border overflow-hidden">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${repo.embedPercent}%` }}
          />
        </div>
        <span className="text-textMuted w-9 text-right">{repo.embedPercent}%</span>
      </div>
    </div>
  );
};

export default IndexingRow;