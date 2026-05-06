import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      env: process.env.NODE_ENV,
      time: new Date().toISOString()
    });
  });

  // Serve static files and handle SPA fallback
  const isProd = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";
  const distPath = path.resolve(__dirname, "dist");
  const distExists = fs.existsSync(distPath);

  console.log(`[SERVER] Environment: ${process.env.NODE_ENV}`);
  console.log(`[SERVER] Dist path: ${distPath}`);
  console.log(`[SERVER] Dist exists: ${distExists}`);

  if (distExists) {
    console.log(`[PROD] Serving static files from: ${distPath}`);
    app.use(express.static(distPath, { index: "index.html" }));
    app.get("*", (req, res) => {
      if (req.url.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log("[DEV] Using Vite middleware");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error("[DEV] Failed to start Vite middleware:", err);
      app.get("*", (req, res) => {
        res.status(500).send("Server Error - Failed to start development middleware");
      });
    }
  }

  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[SERVER] Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JC Talks Server started!`);
    console.log(`Port: ${PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
