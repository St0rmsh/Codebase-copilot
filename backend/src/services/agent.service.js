import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { searchRepoChunks } from "./search.service.js";
import config from "../config/config.js";

const llm = new ChatGoogleGenerativeAI({
  apiKey: config.GOOGLE_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0.2,
});

// Graph state: the conversation history plus retrieved chunks for this turn
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

// Node 1: retrieve relevant code chunks for the latest user question
const retrieveNode = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const query = lastMessage.content;

  const chunks = await searchRepoChunks(state.repoId, query, 6);

  return { retrievedChunks: chunks };
};

// Node 2: generate an answer grounded in the retrieved chunks
const generateNode = async (state) => {
  const contextBlock = state.retrievedChunks
    .map(
      (c, i) =>
        `[${i + 1}] File: ${c.filePath} (lines ${c.startLine}-${c.endLine})\nSymbol: ${c.symbolName}\n\`\`\`\n${c.code}\n\`\`\``
    )
    .join("\n\n");

  const systemPrompt = `You are a codebase onboarding assistant. Answer the user's question using ONLY the provided code context below. Always cite the file path and line numbers for any claim you make (e.g. "in Navbar.jsx (lines 5-50)"). If the context doesn't contain enough information to answer, say so honestly instead of guessing.

CODE CONTEXT:
${contextBlock}`;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages,
  ]);

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

  const result = await codebaseAgent.invoke({
    repoId,
    messages,
  });

  const lastAiMessage = result.messages[result.messages.length - 1];

  return {
    answer: lastAiMessage.content,
    citedChunks: result.retrievedChunks.map((c) => ({
      filePath: c.filePath,
      symbolName: c.symbolName,
      startLine: c.startLine,
      endLine: c.endLine,
    })),
  };
};