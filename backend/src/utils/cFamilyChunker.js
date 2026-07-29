// Regex-based extraction for brace-based languages: C, C++, C#, Java.
// Not a full parser — matches common signature patterns followed by a brace block.

const findMatchingBrace = (code, openIndex) => {
  let depth = 0;
  for (let i = openIndex; i < code.length; i++) {
    if (code[i] === "{") depth++;
    if (code[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return code.length - 1;
};

const lineNumberAt = (code, index) => code.slice(0, index).split("\n").length;

// Matches: [modifiers] returnType methodName(params) {
// Covers Java/C#: public static void main(...) { , private int getX() {
// Covers C/C++: int add(int a, int b) {
const FUNCTION_RE =
  /(?:^|\n)[ \t]*(?:public|private|protected|static|virtual|inline|async|override|final|abstract|synchronized)*\s*[\w<>:,\*&\[\]]+\s+(\w+)\s*\([^;{]*\)\s*(?:const|throws\s+[\w,\s]+)?\s*\{/g;

// Matches: [modifiers] class/struct/interface Name [: base] [implements X] [extends Y] {
const CLASS_RE =
  /(?:^|\n)[ \t]*(?:public|private|protected|final|abstract)*\s*(?:class|struct|interface)\s+(\w+)[^{;]*\{/g;

const extractBlocks = (sourceCode, filePath, regex, chunkType, knownBuiltins) => {
  const chunks = [];
  let match;
  const re = new RegExp(regex.source, "g");

  while ((match = re.exec(sourceCode)) !== null) {
    const name = match[1];
    if (knownBuiltins.has(name)) continue;

    const braceIndex = sourceCode.indexOf("{", match.index + match[0].length - 1);
    if (braceIndex === -1) continue;

    const endIndex = findMatchingBrace(sourceCode, braceIndex);
    const startLine = lineNumberAt(sourceCode, match.index);
    const endLine = lineNumberAt(sourceCode, endIndex);
    const code = sourceCode.slice(match.index, endIndex + 1).trim();

    chunks.push({
      filePath,
      chunkType,
      symbolName: name,
      code,
      startLine,
      endLine,
    });
  }

  return chunks;
};

const CONTROL_KEYWORDS = new Set(["if", "for", "while", "switch", "catch", "else", "try", "finally"]);

export const chunkCFamilyFile = (sourceCode, filePath) => {
  const functions = extractBlocks(sourceCode, filePath, FUNCTION_RE, "function", CONTROL_KEYWORDS);
  const classes = extractBlocks(sourceCode, filePath, CLASS_RE, "class", CONTROL_KEYWORDS);
  return [...functions, ...classes];
};