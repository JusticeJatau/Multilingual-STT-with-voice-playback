import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDatabase } from "./config/db.js";
import speechRoutes from "./routes/speechRoutes.js";

const app = express();
const port = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", speechRoutes);

const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));
app.get("/{*splat}", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  return res.sendFile(path.join(frontendDist, "index.html"));
});

app.use((error, _req, res, _next) => {
  if (error instanceof Error) return res.status(400).json({ message: error.message });
  return res.status(500).json({ message: "Something went wrong." });
});

connectDatabase().finally(() => {
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
});
