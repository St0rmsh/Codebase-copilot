import { parse } from "@babel/parser";
import pkg from "@babel/traverse";
import path from "path";

const traverse = pkg.default || pkg;

const PARSE_OPTIONS = {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
  errorRecovery: true,
};

const JS_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const CSS_EXTENSIONS = new Set([".css", ".scss"]);
const HTML_EXTENSIONS = new Set([".html"]);
const PYTHON_EXTENSIONS = new Set([".py"]);
const C_FAMILY_EXTENSIONS = new Set([".c", ".cpp", ".cc", ".h", ".hpp"]);

const extractJsImportSources = (sourceCode) => {
  let ast;
  try {
    ast = parse(sourceCode, PARSE_OPTIONS);
  } catch {
    return [];
  }
  const sources = [];
  try {
    traverse(ast, {
      ImportDeclaration(nodePath) {
        sources.push(nodePath.node.source.value);
      },
      CallExpression(nodePath) {
        if (
          nodePath.node.callee.name === "require" &&
          nodePath.node.arguments[0]?.type === "StringLiteral"
        ) {
          sources.push(nodePath.node.arguments[0].value);
        }
      },
    });
  } catch {
    return sources;
  }
  return sources;
};

const extractCssImportSources = (sourceCode) => {
  const sources = [];
  const importRegex = /@import\s+(?:url\()?["']([^"')]+)["']\)?/g;
  let match;
  while ((match = importRegex.exec(sourceCode)) !== null) sources.push(match[1]);
  const urlRegex = /url\(["']?(\.\.?\/[^"')]+)["']?\)/g;
  while ((match = urlRegex.exec(sourceCode)) !== null) sources.push(match[1]);
  return sources;
};

const extractHtmlImportSources = (sourceCode) => {
  const sources = [];
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g;
  let match;
  while ((match = scriptRegex.exec(sourceCode)) !== null) sources.push(match[1]);
  const linkRegex = /<link[^>]+href=["']([^"']+)["']/g;
  while ((match = linkRegex.exec(sourceCode)) !== null) sources.push(match[1]);
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
  while ((match = imgRegex.exec(sourceCode)) !== null) sources.push(match[1]);
  return sources;
};

// Python: "from .module import X" or "import module" — only relative imports resolve to repo files
const extractPythonImportSources = (sourceCode) => {
  const sources = [];
  const fromRegex = /^from\s+(\.[\w.]*)\s+import/gm;
  let match;
  while ((match = fromRegex.exec(sourceCode)) !== null) {
    // convert dotted relative module path to a file-path-like string, e.g. ".utils.helpers" -> "./utils/helpers"
    const converted = match[1].replace(/^\.+/, (dots) => "./".repeat(dots.length)).replace(/\./g, "/");
    sources.push(converted);
  }
  return sources;
};

// C/C++: #include "local_header.h" (quotes = local file; angle brackets = system header, skipped)
const extractCFamilyImportSources = (sourceCode) => {
  const sources = [];
  const includeRegex = /#include\s+"([^"]+)"/g;
  let match;
  while ((match = includeRegex.exec(sourceCode)) !== null) {
    sources.push(match[1].startsWith(".") ? match[1] : `./${match[1]}`);
  }
  return sources;
};

const extractImportSources = (sourceCode, extension) => {
  if (JS_EXTENSIONS.has(extension)) return extractJsImportSources(sourceCode);
  if (CSS_EXTENSIONS.has(extension)) return extractCssImportSources(sourceCode);
  if (HTML_EXTENSIONS.has(extension)) return extractHtmlImportSources(sourceCode);
  if (PYTHON_EXTENSIONS.has(extension)) return extractPythonImportSources(sourceCode);
  if (C_FAMILY_EXTENSIONS.has(extension)) return extractCFamilyImportSources(sourceCode);
  return [];
};

const resolveImportToRepoFile = (importSource, currentFilePath, allFilePaths) => {
  if (!importSource.startsWith(".") && !importSource.startsWith("/")) return null;
  if (importSource.startsWith("http://") || importSource.startsWith("https://")) return null;

  const currentDir = path.dirname(currentFilePath);
  const resolvedBase = path.normalize(path.join(currentDir, importSource)).replace(/\\/g, "/");

  const candidates = [
    resolvedBase,
    `${resolvedBase}.js`,
    `${resolvedBase}.jsx`,
    `${resolvedBase}.ts`,
    `${resolvedBase}.tsx`,
    `${resolvedBase}.css`,
    `${resolvedBase}.scss`,
    `${resolvedBase}.py`,
    `${resolvedBase}.h`,
    `${resolvedBase}.hpp`,
    `${resolvedBase}.c`,
    `${resolvedBase}.cpp`,
    `${resolvedBase}/index.js`,
    `${resolvedBase}/index.jsx`,
    `${resolvedBase}/index.ts`,
    `${resolvedBase}/index.tsx`,
    `${resolvedBase}/__init__.py`,
  ];

  return candidates.find((c) => allFilePaths.has(c)) || null;
};

export const buildImportGraph = (filesWithContent) => {
  const allFilePaths = new Set(filesWithContent.map((f) => f.path));
  const edges = [];

  for (const file of filesWithContent) {
    const importSources = extractImportSources(file.code, file.extension);
    for (const source of importSources) {
      const resolved = resolveImportToRepoFile(source, file.path, allFilePaths);
      if (resolved && resolved !== file.path) {
        edges.push({ from: file.path, to: resolved });
      }
    }
  }

  return edges;
};