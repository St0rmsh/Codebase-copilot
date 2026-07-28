const variantStyles = {
  error: "border-accent text-accent",
  success: "border-accentSoft text-accentSoft",
  info: "border-border text-textMuted",
};

const Toast = ({ toast, onDismiss }) => {
  return (
    <div
      className={`bg-panel border ${variantStyles[toast.type] || variantStyles.info} px-4 py-3 min-w-[280px] max-w-sm shadow-lg animate-slide-in`}
    >
      <div className="flex justify-between items-start gap-3">
        <p className="font-mono text-xs leading-relaxed">{toast.message}</p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-textMuted hover:text-white shrink-0 leading-none"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;