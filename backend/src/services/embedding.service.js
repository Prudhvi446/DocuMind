const { GoogleGenerativeAI, TaskType } = require("@google/generative-ai");
const { env } = require("../config/env.js");

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
// Using text-embedding-004 which outputs 768 dimensions
const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });

async function embedText(text) {
  const result = await model.embedContent({
    content: { parts: [{ text }], role: "user" },
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    outputDimensionality: 768,
  });
  return result.embedding.values;
}

async function embedQuery(text) {
  const result = await model.embedContent({
    content: { parts: [{ text }], role: "user" },
    taskType: TaskType.RETRIEVAL_QUERY,
    outputDimensionality: 768,
  });
  return result.embedding.values;
}

module.exports = { embedText, embedQuery };
