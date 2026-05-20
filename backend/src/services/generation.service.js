const { GoogleGenerativeAI } = require("@google/generative-ai");
const { env } = require("../config/env.js");

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
// SWAP MODEL HERE when gemini-1.5-flash is available in the API
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction:
    "You are a helpful support assistant for a SaaS product. " +
    "Answer the user's question using ONLY the provided documentation context. " +
    "Be concise, accurate, and professional. " +
    "If the answer is not clearly in the context, say so honestly.",
});

async function generateAnswer(question, chunks) {
  const context = chunks.map((c) => c.content).join("\n\n---\n\n");
  const prompt = `Documentation context:\n\n${context}\n\nQuestion: ${question}`;
  const result = await model.generateContent(prompt);
  const response = result.response;
  return {
    answer: response.text(),
    inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
  };
}

module.exports = { generateAnswer };
