import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("jctalks.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    dob TEXT,
    gender TEXT,
    language TEXT,
    trial_start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_subscribed BOOLEAN DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

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

  app.post("/api/user", (req, res) => {
    const { id, name, dob, gender, language } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO users (id, name, dob, gender, language)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name,
          dob=excluded.dob,
          gender=excluded.gender,
          language=excluded.language
      `);
      stmt.run(id, name, dob, gender, language);
      
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/user/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Serve static files and handle SPA fallback
  const isProd = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";
  const distPath = path.resolve(__dirname, "dist");
  const distExists = fs.existsSync(distPath);

  console.log(`[SERVER] Environment: ${process.env.NODE_ENV}`);
  console.log(`[SERVER] Dist path: ${distPath}`);
  console.log(`[SERVER] Dist exists: ${distExists}`);

  // If dist exists, we prefer serving static files for better reliability in Shared App URL
  if (distExists) {
    console.log(`[PROD] Serving static files from: ${distPath}`);
    app.use(express.static(distPath, { index: "index.html" }));
    app.get("*", (req, res) => {
      if (req.url.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
      }
      console.log(`[PROD] Fallback to index.html for: ${req.url}`);
      res.sendFile(path.join(distPath, "index.html"), (err) => {
        if (err) {
          console.error("[PROD] Error sending index.html:", err);
          res.status(500).send("Internal Server Error - Missing build artifacts");
        }
      });
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
    console.log(`Serving from: ${distPath}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
