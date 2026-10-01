import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { searchRepoChunks } from "./search.service.js";
import config from "../config/config.js";
import { searchMultiRepoChunks } from "./search.service.js";


// const geminiLLM = new ChatGoogleGenerativeAI({
//   apiKey: config.GOOGLE_API_KEY,
//   model: "gemini-2.0-flash",
//   temperature: 0.2,
// });

const mistralLLM = new ChatMistralAI({
  apiKey: config.MISTRAL_API_KEY,
  model: "mistral-small-latest",
  temperature: 0.2,
});

const cohereLLM = new ChatCohere({
  apiKey: config.COHERE_API_KEY,
  model: config.COHERE_MODEL,
  temperature: 0.2,
});

const PROVIDERS = [
  { name: "mistral", llm: mistralLLM },
  { name: "cohere", llm: cohereLLM },
];

const providerCooldowns = new Map();
const isRateLimitError = (error) => {
  const status = error.status ?? error.statusCode ?? error.response?.status ?? error.cause?.status;
  return status === 429 || /rate[\s_-]*limit|status\s*429/i.test(error.message || "");
};

const markRateLimited = (name, error) => {
  const retryAfter = error.response?.headers?.["retry-after"] || error.headers?.["retry-after"];
  const retrySeconds = Number(retryAfter);
  const cooldownMs = Number.isFinite(retrySeconds) && retrySeconds > 0
    ? Math.min(retrySeconds * 1000, 5 * 60 * 1000)
    : 60 * 1000;
  providerCooldowns.set(name, Date.now() + cooldownMs);
};

const isCoolingDown = (name) => {
  const until = providerCooldowns.get(name);
  if (!until) return false;
  if (until <= Date.now()) {
    providerCooldowns.delete(name);
    return false;
  }
  return true;
};

const invokeWithFallback = async (messages) => {
  let lastError;
  for (const { name, llm } of PROVIDERS) {
    if (isCoolingDown(name)) continue;
    try {
      const response = await llm.invoke(messages);
      return { response, provider: name };
    } catch (err) {
      console.error(`${name} failed:`, err.message);
      if (isRateLimitError(err)) markRateLimited(name, err);
      lastError = err;
    }
  }
  throw lastError;
};

async function* streamWithFallback(messages) {
  let lastError;
  for (const { name, llm } of PROVIDERS) {
    if (isCoolingDown(name)) continue;
    let emittedToken = false;
    try {
      const stream = await llm.stream(messages);
      for await (const chunk of stream) {
        if (chunk.content) {
          emittedToken = true;
          yield chunk.content;
        }
      }
      return;
    } catch (err) {
      console.error(`${name} streaming failed:`, err.message);
      if (isRateLimitError(err)) markRateLimited(name, err);
      lastError = err;
      if (emittedToken) throw err;
    }
  }
  throw lastError || new Error("All chat providers are temporarily rate limited. Please retry shortly.");
}

const AgentState = Annotation.Root({
  messages: Annotation({
    reducer: (prev, next) => prev.concat(next),
    default: () => [],
  }),
  repoId: Annotation(),
  retrievedChunks: Annotation({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
});

const retrieveNode = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const query = lastMessage.content;
  const chunks = await searchRepoChunks(state.repoId, query, 6);
  return { retrievedChunks: chunks };
};

const buildSystemPrompt = (chunks) => {
  const contextBlock = chunks
    .map(
      (c, i) =>
        `[${i + 1}] File: ${c.filePath} (lines ${c.startLine}-${c.endLine})\nSymbol: ${c.symbolName}\n\`\`\`\n${c.code}\n\`\`\``
    )
    .join("\n\n");

  return `You are a codebase onboarding assistant. Answer the user's question using ONLY the provided code context below. Always cite the file path and line numbers for any claim you make (e.g. "in Navbar.jsx (lines 5-50)"). If the context doesn't contain enough information to answer, say so honestly instead of guessing.

CODE CONTEXT:
${contextBlock}`;
};

const generateNode = async (state) => {
  if (state.retrievedChunks.length === 0) {
    return {
      messages: [
        new AIMessage(
          "I couldn't find indexed code for this repository. Open Debugger to re-run chunking and embedding, or use Deploy to rebuild it, then try again."
        ),
      ],
    };
  }

  const systemPrompt = buildSystemPrompt(state.retrievedChunks);
  const messages = [new SystemMessage(systemPrompt), ...state.messages];
  const { response, provider } = await invokeWithFallback(messages);
  console.log(`Answer generated using: ${provider}`);
  return { messages: [new AIMessage(response.content)] };
};

const graph = new StateGraph(AgentState)
  .addNode("retrieve", retrieveNode)
  .addNode("generate", generateNode)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", END);

export const codebaseAgent = graph.compile();




export const runAgent = async (repoId, conversationHistory, newQuestion) => {
  const messages = conversationHistory.map((m) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
  );
  messages.push(new HumanMessage(newQuestion));

  const result = await codebaseAgent.invoke({ repoId, messages });
  const lastAiMessage = result.messages[result.messages.length - 1];

  return {
    answer: lastAiMessage.content,
    citedChunks: result.retrievedChunks.map((c) => ({
      filePath: c.filePath,
      symbolName: c.symbolName,
      startLine: c.startLine,
      endLine: c.endLine,
      code: c.code,
    })),
  };
};




export const runAgentStream = async (repoId, conversationHistory, newQuestion) => {
  const chunks = await searchRepoChunks(repoId, newQuestion, 6);

  if (chunks.length === 0) {
    const message =
      "I couldn't find indexed code for this repository. Open Debugger to re-run chunking and embedding, or use Deploy to rebuild it, then try again.";
    return {
      tokenStream: (async function* () {
        yield message;
      })(),
      citedChunks: [],
    };
  }

  const systemPrompt = buildSystemPrompt(chunks);
  const historyMessages = conversationHistory.map((m) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
  );
  const messages = [new SystemMessage(systemPrompt), ...historyMessages, new HumanMessage(newQuestion)];

  const citedChunks = chunks.map((c) => ({
    filePath: c.filePath,
    symbolName: c.symbolName,
    startLine: c.startLine,
    endLine: c.endLine,
    code: c.code,
  }));

  return {
    tokenStream: streamWithFallback(messages),
    citedChunks,
  };
};








const buildMultiRepoSystemPrompt = (chunks, repoNameById) => {
  const contextBlock = chunks
    .map((c, i) => {
      const repoName = repoNameById[c.repo?.toString()] || "unknown-repo";
      return `[${i + 1}] Repo: ${repoName} | File: ${c.filePath} (lines ${c.startLine}-${c.endLine})\nSymbol: ${c.symbolName}\n\`\`\`\n${c.code}\n\`\`\``;
    })
    .join("\n\n");

  return `You are a codebase onboarding assistant with access to MULTIPLE repositories. Answer the user's question using ONLY the provided code context below. Always cite which repo AND file/line the information comes from (e.g. "in api-server/auth.js (lines 5-50)"). When comparing or relating code across repos, be explicit about which repo each piece belongs to. If the context doesn't contain enough information, say so honestly.

CODE CONTEXT FROM MULTIPLE REPOS:
${contextBlock}`;
};

export const runMultiRepoAgentStream = async (repoIds, repoNameById, conversationHistory, newQuestion) => {
  const chunks = await searchMultiRepoChunks(repoIds, newQuestion, 4);

  if (chunks.length === 0) {
    const message =
      "I couldn't find indexed code in the selected repositories. Open Debugger to re-run chunking and embedding for them, then try again.";
    return {
      tokenStream: (async function* () {
        yield message;
      })(),
      citedChunks: [],
    };
  }

  const systemPrompt = buildMultiRepoSystemPrompt(chunks, repoNameById);
  const historyMessages = conversationHistory.map((m) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
  );
  const messages = [new SystemMessage(systemPrompt), ...historyMessages, new HumanMessage(newQuestion)];

  const citedChunks = chunks.map((c) => ({
    repoId: c.repo,
    repoName: repoNameById[c.repo?.toString()] || "unknown-repo",
    filePath: c.filePath,
    symbolName: c.symbolName,
    startLine: c.startLine,
    endLine: c.endLine,
    code: c.code,
  }));

  return {
    tokenStream: streamWithFallback(messages),
    citedChunks,
  };
};