import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { searchRepoChunks } from "./search.service.js";
import config from "../config/config.js";

const geminiLLM = new ChatGoogleGenerativeAI({
  apiKey: config.GOOGLE_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0.2,
});

const mistralLLM = new ChatMistralAI({
  apiKey: config.MISTRAL_API_KEY,
  model: "mistral-small-latest",
  temperature: 0.2,
});

const cohereLLM = new ChatCohere({
  apiKey: config.COHERE_API_KEY,
  model: "command-r",
  temperature: 0.2,
});

const PROVIDERS = [
  { name: "gemini", llm: geminiLLM },
  { name: "mistral", llm: mistralLLM },
  { name: "cohere", llm: cohereLLM },
];

const invokeWithFallback = async (messages) => {
  let lastError;
  for (const { name, llm } of PROVIDERS) {
    try {
      const response = await llm.invoke(messages);
      return { response, provider: name };
    } catch (err) {
      console.error(`${name} failed:`, err.message);
      lastError = err;
    }
  }
  throw lastError;
};

async function* streamWithFallback(messages) {
  let lastError;
  for (const { name, llm } of PROVIDERS) {
    try {
      const stream = await llm.stream(messages);
      for await (const chunk of stream) {
        if (chunk.content) yield chunk.content;
      }
      return;
    } catch (err) {
      console.error(`${name} streaming failed:`, err.message);
      lastError = err;
    }
  }
  throw lastError;
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