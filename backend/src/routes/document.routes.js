const express = require("express");
const {
  uploadMiddleware,
  uploadDocument,
  listDocuments,
  deleteDocument,
} = require("../controllers/document.controller.js");
const { authMiddleware } = require("../middleware/auth.js");

const router = express.Router();

router.use(authMiddleware);

router.post("/upload", uploadMiddleware, uploadDocument);
router.get("/", listDocuments);
router.delete("/:id", deleteDocument);

module.exports = router;
