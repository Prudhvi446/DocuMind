const express = require("express");
const { query, getHistory } = require("../controllers/query.controller.js");
const { authMiddleware } = require("../middleware/auth.js");
const { rateLimiter } = require("../middleware/rateLimiter.js");

const router = express.Router();

router.get("/history", authMiddleware, getHistory);
router.post("/", authMiddleware, rateLimiter, query);

module.exports = router;
