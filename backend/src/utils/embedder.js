import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/config.js";

const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const embedText = async (text) => {
  const truncated = text.slice(0, 8000);
  const result = await embeddingModel.embedContent(truncated);
  return result.embedding.values;
};

export const embedTextBatch = async (texts, delayMs = 150) => {
  const embeddings = [];
  for (const text of texts) {
    const embedding = await embedText(text);
    embeddings.push(embedding);
    await sleep(delayMs);
  }
  return embeddings;
};