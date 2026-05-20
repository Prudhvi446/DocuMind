const express = require("express");
const { getAnalytics } = require("../controllers/analytics.controller.js");
const { authMiddleware } = require("../middleware/auth.js");

const router = express.Router();

router.get("/", authMiddleware, getAnalytics);

module.exports = router;
