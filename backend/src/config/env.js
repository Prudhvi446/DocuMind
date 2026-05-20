require("dotenv").config();

const required = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "GEMINI_API_KEY",
  "PORT",
  "UPLOAD_DIR",
  "SIMILARITY_THRESHOLD",
  "CACHE_TTL_SECONDS",
  "FRONTEND_URL",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  PORT: parseInt(process.env.PORT, 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  SIMILARITY_THRESHOLD: parseFloat(process.env.SIMILARITY_THRESHOLD),
  CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS, 10),
  FRONTEND_URL: process.env.FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
};

module.exports = { env };
