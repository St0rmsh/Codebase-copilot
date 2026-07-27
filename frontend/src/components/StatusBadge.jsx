const statusConfig = {
  indexed: { label: "INDEXED", color: "bg-accent" },
  pending: { label: "PENDING", color: "bg-textMuted" },
  cloning: { label: "SYNCING...", color: "bg-accentSoft" },
  failed: { label: "FAILED", color: "bg-red-600" },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="flex items-center gap-2 font-mono text-xs tracking-widest2 uppercase text-textMuted">
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${config.color}`} />
      {config.label}
    </div>
  );
};

export default StatusBadge;