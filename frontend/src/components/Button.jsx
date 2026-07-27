const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const base = "font-mono text-sm tracking-widest2 uppercase py-3.5 px-6 transition disabled:opacity-50";
  const variants = {
    primary: "bg-accent hover:bg-accent/90 text-white",
    outline: "border border-border hover:border-white/50 text-white",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;