const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { env } = require("./config/env.js");
const { errorHandler } = require("./middleware/errorHandler.js");
const authRoutes = require("./routes/auth.routes.js");
const documentRoutes = require("./routes/document.routes.js");
const queryRoutes = require("./routes/query.routes.js");
const analyticsRoutes = require("./routes/analytics.routes.js");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`DocuMind API listening on port ${env.PORT}`);
});
