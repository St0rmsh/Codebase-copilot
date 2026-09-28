import axios from "axios";
import config from "../config/config.js";

const MISTRAL_EMBED_URL = "https://api.mistral.ai/v1/embeddings";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const callMistralEmbed = async (text) => {
  const truncated = text.slice(0, 8000);

  const response = await axios.post(
    MISTRAL_EMBED_URL,
    {
      model: "mistral-embed",
      input: [truncated],
    },
    {
      headers: {
        Authorization: `Bearer ${config.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data[0].embedding;
};

export const embedText = async (text) => {
  return await callMistralEmbed(text);
};

export const embedQuery = async (text) => {
  return await callMistralEmbed(text); // Mistral doesn't distinguish query/document embedding types
};

export const embedTextBatch = async (texts, delayMs = 200) => {
  const embeddings = [];
  for (const text of texts) {
    const embedding = await embedText(text);
    embeddings.push(embedding);
    await sleep(delayMs);
  }
  return embeddings;
};