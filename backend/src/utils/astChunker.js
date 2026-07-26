import { parse } from "@babel/parser";
import pkg from "@babel/traverse";

const traverse = pkg.default || pkg;

const PARSE_OPTIONS = {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
  errorRecovery: true,
};

const getName = (node) => {
  if (node.id?.name) return node.id.name;
  if (node.key?.name) return node.key.name;
  return "anonymous";
};

const getLines = (node) => ({
  startLine: node.loc?.start.line ?? 0,
  endLine: node.loc?.end.line ?? 0,
});

const isReactComponent = (name) => /^[A-Z]/.test(name || "");

export const chunkFile = (sourceCode, filePath) => {
  const chunks = [];

  let ast;
  try {
    ast = parse(sourceCode, PARSE_OPTIONS);
  } catch (err) {
    console.error(`Failed to parse ${filePath}:`, err.message);
    return [];
  }

  try {
    traverse(ast, {
      FunctionDeclaration(path) {
        const name = getName(path.node);
        const { startLine, endLine } = getLines(path.node);
        chunks.push({
          filePath,
          chunkType: isReactComponent(name) ? "component" : "function",
          symbolName: name,
          code: sourceCode.slice(path.node.start, path.node.end),
          startLine,
          endLine,
        });
        path.skip();
      },

      ClassDeclaration(path) {
        const name = getName(path.node);
        const { startLine, endLine } = getLines(path.node);
        chunks.push({
          filePath,
          chunkType: "class",
          symbolName: name,
          code: sourceCode.slice(path.node.start, path.node.end),
          startLine,
          endLine,
        });
        path.skip();
      },

    VariableDeclarator(path) {
        const init = path.node.init;
        if (init && (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression")) {
        const name = getName(path.node);
        const declarationNode = path.parentPath.node; 
        const { startLine, endLine } = getLines(declarationNode);
    chunks.push({
      filePath,
      chunkType: isReactComponent(name) ? "component" : "arrow_function",
      symbolName: name,
      code: sourceCode.slice(declarationNode.start, declarationNode.end),
      startLine,
      endLine,
    });
    path.skip();
  }
},
    });
  } catch (err) {
    console.error(`Failed to traverse ${filePath}:`, err.message);
    return [];
  }

  return chunks;
};