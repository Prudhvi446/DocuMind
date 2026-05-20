const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { z } = require("zod");
const prisma = require("../lib/prisma.js");
const { env } = require("../config/env.js");
const { embeddingQueue } = require("../queues/embedding.queue.js");

const ALLOWED_MIMES = ["application/pdf", "text/plain"];

const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

function uploadMiddleware(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "File too large (max 10MB)",
          code: "FILE_TOO_LARGE",
        });
      }
      return next(err);
    }
    next();
  });
}

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file provided",
        code: "NO_FILE",
      });
    }

    if (!ALLOWED_MIMES.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: "Unsupported file type",
        code: "INVALID_FILE_TYPE",
      });
    }

    const document = await prisma.document.create({
      data: {
        tenantId: req.tenantId,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        status: "pending",
      },
    });

    await embeddingQueue.add("embed", {
      documentId: document.id,
      tenantId: req.tenantId,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
    });

    res.status(202).json({ documentId: document.id, status: "pending" });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
}

async function listDocuments(req, res, next) {
  try {
    const documents = await prisma.document.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { chunks: true } },
      },
    });

    const result = documents.map((doc) => ({
      id: doc.id,
      filename: doc.filename,
      status: doc.status,
      createdAt: doc.createdAt,
      chunkCount: doc._count.chunks,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
}

const idSchema = z.object({ id: z.string().uuid() });

async function deleteDocument(req, res, next) {
  try {
    const parsed = idSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid document id",
        code: "VALIDATION_ERROR",
      });
    }

    const document = await prisma.document.findUnique({
      where: { id: parsed.data.id },
    });

    if (!document) {
      return res.status(404).json({
        error: "Document not found",
        code: "NOT_FOUND",
      });
    }

    if (document.tenantId !== req.tenantId) {
      return res.status(403).json({
        error: "Forbidden",
        code: "FORBIDDEN",
      });
    }

    await prisma.document.delete({ where: { id: document.id } });
    res.json({ message: "Document deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadMiddleware,
  uploadDocument,
  listDocuments,
  deleteDocument,
};
