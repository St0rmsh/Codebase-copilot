const MultiRepoCitationChip = ({ chunk }) => (
  <div className="font-mono text-xs bg-border text-textMuted px-2 py-1 flex items-center gap-1.5">
    <span className="text-accentSoft">{chunk.repoName}</span>
    <span>·</span>
    <span>{chunk.filePath.split("/").pop()}:{chunk.startLine}</span>
  </div>
);

export default MultiRepoCitationChip;