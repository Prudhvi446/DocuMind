const redis = require("../lib/redis.js");
const { env } = require("../config/env.js");

async function get(key) {
  const value = await redis.get(key);
  if (!value) return null;
  return JSON.parse(value);
}

async function set(key, value, ttlSeconds = env.CACHE_TTL_SECONDS) {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

module.exports = { get, set };
