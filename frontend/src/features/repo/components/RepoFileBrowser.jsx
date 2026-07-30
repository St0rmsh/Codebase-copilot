import { useState, useMemo } from "react";
import { buildFileTree } from "../utils/fileTree";
import { fetchFileChunks } from "../services/repoService";
import FileTreeNode from "./FileTreeNode";
import CodeViewer from "../../chat/components/CodeViewer";

const RepoFileBrowser = ({ repo }) => {
  const [activeFilePath, setActiveFilePath] = useState(null);
  const [activeChunk, setActiveChunk] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const tree = useMemo(() => buildFileTree(repo?.files || []), [repo?.files]);
  const treeEntries = Object.entries(tree).sort(([, a], [, b]) => {
    if (a.__isFile === b.__isFile) return 0;
    return a.__isFile ? 1 : -1;
  });

  const handleFileClick = async (filePath) => {
    if (!repo?._id) return;
    setActiveFilePath(filePath);
    setLoadingFile(true);
    try {
      const data = await fetchFileChunks(repo._id, filePath);
      if (data.chunks.length > 0) {
        setActiveChunk(data.chunks[0]);
      } else {
        setActiveChunk({
          filePath,
          code: "// No indexed symbols in this file (may only contain imports, styles, or config).",
          startLine: 1,
        });
      }
    } catch {
      setActiveChunk({ filePath, code: "// Failed to load file content.", startLine: 1 });
    } finally {
      setLoadingFile(false);
    }
  };

  if (!repo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase">
          No repository selected
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-72 border-r border-border flex flex-col">
        <div className="px-3 py-2.5 border-b border-border font-mono text-xs text-textMuted tracking-widest2 uppercase">
          {(repo.files || []).length} files
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {treeEntries.map(([name, node]) => (
            <FileTreeNode
              key={name}
              name={name}
              node={node}
              onFileClick={handleFileClick}
              activeFilePath={activeFilePath}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeFilePath && (
          <div className="px-4 py-2.5 border-b border-border font-mono text-xs text-textMuted truncate">
            {activeFilePath}
          </div>
        )}
        {loadingFile ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-xs text-textMuted animate-pulse">Loading file...</p>
          </div>
        ) : activeChunk ? (
          <CodeViewer chunk={activeChunk} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase">
              Select a file to view its contents
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoFileBrowser;