import axios from "axios";
import config from "../config/config.js";

const MISTRAL_EMBED_URL = "https://api.mistral.ai/v1/embeddings";

// Single source of truth. The Atlas vector index numDimensions must equal this.
export const EMBEDDING_MODEL = "mistral-embed";
export const EMBEDDING_DIMENSIONS = 1024;

const MAX_INPUT_CHARS = 8000;

const callMistralEmbedBatch = async (texts) => {
  const response = await axios.post(
    MISTRAL_EMBED_URL,
    {
      model: EMBEDDING_MODEL,
      input: texts.map((text) => text.slice(0, MAX_INPUT_CHARS)),
    },
    {
      headers: {
        Authorization: `Bearer ${config.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = response.data.data.sort((left, right) => left.index - right.index);
  if (data.length !== texts.length) {
    throw new Error(`Embedding response count mismatch: expected ${texts.length}, got ${data.length}`);
  }

  return data.map(({ embedding }) => {
    if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Embedding dimension mismatch: expected ${EMBEDDING_DIMENSIONS}, got ${embedding?.length}`
      );
    }
    return embedding;
  });
};

const callMistralEmbed = async (text) => {
  const [embedding] = await callMistralEmbedBatch([text]);
  return embedding;
};

export const embedText = async (text) => {
  return await callMistralEmbed(text);
};

export const embedQuery = async (text) => {
  return await callMistralEmbed(text); 
};

export const embedTextBatch = async (texts, batchSize = 16) => {
  const embeddings = [];
  for (let offset = 0; offset < texts.length; offset += batchSize) {
    const batch = texts.slice(offset, offset + batchSize);
    embeddings.push(...await callMistralEmbedBatch(batch));
  }
  return embeddings;
};