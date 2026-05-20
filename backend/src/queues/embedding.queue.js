const { Queue } = require("bullmq");
const { env } = require("../config/env.js");

const connection = {
  url: env.REDIS_URL,
};

const embeddingQueue = new Queue("embedding", { connection });

module.exports = { embeddingQueue };
