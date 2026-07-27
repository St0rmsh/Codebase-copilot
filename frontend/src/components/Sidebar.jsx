import { NavLink } from "react-router-dom";
import Button from "./Button";

const navItems = [
  { label: "Workspace", path: "/dashboard", icon: "▣" },
  { label: "Repository", path: "/repository", icon: "⌘" },
  { label: "Debugger", path: "/debugger", icon: "⚙" },
  { label: "Indexing", path: "/indexing", icon: "▤" },
  { label: "Settings", path: "/settings", icon: "⚙" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-base border-r border-border flex flex-col justify-between min-h-screen py-6">
      <div>
        <div className="px-6 mb-10">
          <h1 className="font-display text-xl text-accentSoft tracking-wide">CODEBASE</h1>
          <p className="font-mono text-xs text-textMuted tracking-widest2">COPILOT</p>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 font-mono text-xs tracking-widest2 uppercase border-l-2 transition ${
                  isActive
                    ? "border-accent text-accent bg-panel"
                    : "border-transparent text-textMuted hover:text-white"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-6">
        <Button variant="primary" className="w-full mb-6">
          New Project
        </Button>
        <div className="border-t border-border pt-4 flex flex-col gap-3 font-mono text-xs text-textMuted tracking-widest2 uppercase">
          <button className="text-left hover:text-white">Documentation</button>
          <button className="text-left hover:text-white flex items-center gap-2">
            Terminal <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;