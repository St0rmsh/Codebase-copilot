import { parse } from "@babel/parser";
import pkg from "@babel/traverse";

const traverse = pkg.default || pkg;

const PARSE_OPTIONS = {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
  errorRecovery: true,
};

// For a given file's code, find which known symbol names get called within it.
// Returns [{ caller: symbolName, callee: symbolName }] — both must be in the knownSymbols set.
export const extractCallEdges = (sourceCode, filePath, knownSymbolNames) => {
  let ast;
  try {
    ast = parse(sourceCode, PARSE_OPTIONS);
  } catch {
    return [];
  }

  const edges = [];
  let currentFunctionStack = [];

  const getCurrentCaller = () => currentFunctionStack[currentFunctionStack.length - 1] || null;

  try {
    traverse(ast, {
      FunctionDeclaration: {
        enter(path) {
          currentFunctionStack.push(path.node.id?.name || "anonymous");
        },
        exit() {
          currentFunctionStack.pop();
        },
      },
      VariableDeclarator: {
        enter(path) {
          const isFn =
            path.node.init?.type === "ArrowFunctionExpression" ||
            path.node.init?.type === "FunctionExpression";
          if (isFn) {
            currentFunctionStack.push(path.node.id?.name || "anonymous");
          }
        },
        exit(path) {
          const isFn =
            path.node.init?.type === "ArrowFunctionExpression" ||
            path.node.init?.type === "FunctionExpression";
          if (isFn) currentFunctionStack.pop();
        },
      },
      CallExpression(path) {
        const callee = path.node.callee;
        let calleeName = null;

        if (callee.type === "Identifier") calleeName = callee.name;
        else if (callee.type === "JSXIdentifier") calleeName = callee.name;

        if (calleeName && knownSymbolNames.has(calleeName)) {
          const caller = getCurrentCaller();
          if (caller && caller !== calleeName) {
            edges.push({ caller, callee: calleeName, callerFile: filePath });
          }
        }
      },
      // JSX usage counts as a "call" too: <Navbar/> means App calls Navbar
      JSXOpeningElement(path) {
        const name = path.node.name?.name;
        if (name && knownSymbolNames.has(name)) {
          const caller = getCurrentCaller();
          if (caller && caller !== name) {
            edges.push({ caller, callee: name, callerFile: filePath });
          }
        }
      },
    });
  } catch {
    return edges;
  }

  return edges;
};