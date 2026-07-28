import { useState } from "react";

const FileTreeNode = ({ name, node, onFileClick, activeFilePath, depth = 0 }) => {
  const [open, setOpen] = useState(depth < 1);

  if (node.__isFile) {
    const isActive = node.path === activeFilePath;
    return (
      <button
        onClick={() => onFileClick(node.path)}
        style={{ paddingLeft: `${depth * 14 + 12}px` }}
        className={`w-full text-left py-1.5 font-mono text-xs truncate transition ${
          isActive ? "text-accent bg-panel" : "text-textMuted hover:text-white"
        }`}
      >
        {name}
      </button>
    );
  }

  const entries = Object.entries(node.children).sort(([, a], [, b]) => {
    if (a.__isFile === b.__isFile) return 0;
    return a.__isFile ? 1 : -1; // folders first
  });

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ paddingLeft: `${depth * 14 + 12}px` }}
        className="w-full text-left py-1.5 font-mono text-xs text-textMuted hover:text-white flex items-center gap-1.5"
      >
        <span className="text-accentSoft">{open ? "▾" : "▸"}</span>
        {name}
      </button>
      {open && (
        <div>
          {entries.map(([childName, childNode]) => (
            <FileTreeNode
              key={childName}
              name={childName}
              node={childNode}
              onFileClick={onFileClick}
              activeFilePath={activeFilePath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;