// Regex-based extraction for Python — no AST parser dependency needed for this scope.
const FUNCTION_RE = /^(\s*)def\s+(\w+)\s*\(/gm;
const CLASS_RE = /^(\s*)class\s+(\w+)\s*[\(:]/gm;

const findBlockEnd = (lines, startLine, indentLevel) => {
  for (let i = startLine + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    const lineIndent = line.match(/^(\s*)/)[1].length;
    if (lineIndent <= indentLevel) return i; // dedent — block ended
  }
  return lines.length;
};

export const chunkPythonFile = (sourceCode, filePath) => {
  const chunks = [];
  const lines = sourceCode.split("\n");

  const extract = (regex, chunkType) => {
    let match;
    const re = new RegExp(regex);
    while ((match = re.exec(sourceCode)) !== null) {
      const upToMatch = sourceCode.slice(0, match.index);
      const startLine = upToMatch.split("\n").length;
      const indent = match[1].length;
      const name = match[2];

      const endLineIdx = findBlockEnd(lines, startLine - 1, indent);
      const code = lines.slice(startLine - 1, endLineIdx).join("\n");

      chunks.push({
        filePath,
        chunkType,
        symbolName: name,
        code,
        startLine,
        endLine: endLineIdx,
      });
    }
  };

  extract(FUNCTION_RE.source, "function");
  extract(CLASS_RE.source, "class");

  return chunks;
};