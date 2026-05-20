const express = require("express");
const { register, login, me } = require("../controllers/auth.controller.js");
const { authMiddleware } = require("../middleware/auth.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);

module.exports = router;
