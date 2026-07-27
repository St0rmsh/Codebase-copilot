const CitationChip = ({ chunk, onClick }) => (
  <button
    onClick={() => onClick(chunk)}
    className="font-mono text-xs bg-border hover:bg-accent/20 hover:text-accentSoft text-textMuted px-2 py-1 transition"
  >
    {chunk.filePath.split("/").pop()}:{chunk.startLine}
  </button>
);

export default CitationChip;