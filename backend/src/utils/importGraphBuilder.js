import { parse } from "@babel/parser";
import pkg from "@babel/traverse";
import path from "path";

const traverse = pkg.default || pkg;

const PARSE_OPTIONS = {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
  errorRecovery: true,
};

// Extracts raw import source strings from a single file's code (e.g. "./Navbar", "react")
const extractImportSources = (sourceCode) => {
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
      // also catch require() calls for older/mixed codebases
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

// Resolves a relative import ("./Navbar") to an actual file in the repo's known file list.
// Skips node_modules/external packages (anything not starting with . or /).
const resolveImportToRepoFile = (importSource, currentFilePath, allFilePaths) => {
  if (!importSource.startsWith(".") && !importSource.startsWith("/")) {
    return null; // external package, e.g. "react", "gsap" — not part of the graph
  }

  const currentDir = path.dirname(currentFilePath);
  const resolvedBase = path.normalize(path.join(currentDir, importSource)).replace(/\\/g, "/");

  const candidates = [
    resolvedBase,
    `${resolvedBase}.js`,
    `${resolvedBase}.jsx`,
    `${resolvedBase}.ts`,
    `${resolvedBase}.tsx`,
    `${resolvedBase}/index.js`,
    `${resolvedBase}/index.jsx`,
    `${resolvedBase}/index.ts`,
    `${resolvedBase}/index.tsx`,
  ];

  return candidates.find((c) => allFilePaths.has(c)) || null;
};

export const buildImportGraph = (filesWithContent) => {
  // filesWithContent: [{ path, code }]
  const allFilePaths = new Set(filesWithContent.map((f) => f.path));
  const edges = [];

  for (const file of filesWithContent) {
    const importSources = extractImportSources(file.code);

    for (const source of importSources) {
      const resolved = resolveImportToRepoFile(source, file.path, allFilePaths);
      if (resolved && resolved !== file.path) {
        edges.push({ from: file.path, to: resolved });
      }
    }
  }

  return edges;
};