import { useState, useMemo } from "react";
import { buildFileTree } from "../utils/fileTree";
import { fetchFileChunks } from "../services/repoService";
import FileTreeNode from "./FileTreeNode";
import CodeViewer from "../../chat/components/CodeViewer";

const RepoFileBrowser = ({ repo }) => {
  const [activeFilePath, setActiveFilePath] = useState(null);
  const [activeChunk, setActiveChunk] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const tree = useMemo(() => buildFileTree(repo.files || []), [repo.files]);
  const treeEntries = Object.entries(tree).sort(([, a], [, b]) => {
    if (a.__isFile === b.__isFile) return 0;
    return a.__isFile ? 1 : -1;
  });

  const handleFileClick = async (filePath) => {
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

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-72 border-r border-border overflow-y-auto py-2">
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

      <div className="flex-1 flex flex-col">
        {loadingFile ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-xs text-textMuted animate-pulse">Loading file...</p>
          </div>
        ) : (
          <CodeViewer chunk={activeChunk} />
        )}
      </div>
    </div>
  );
};

export default RepoFileBrowser;