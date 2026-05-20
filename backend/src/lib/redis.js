const Redis = require("ioredis");
const { env } = require("../config/env.js");

const redis = new Redis(env.REDIS_URL);

module.exports = redis;
