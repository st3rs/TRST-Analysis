import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // External Threat Intelligence Integration
  app.get("/api/threat-intel", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) return res.status(400).json({ error: "Missing url parameter" });

      const vtKey = process.env.VIRUSTOTAL_API_KEY;
      if (!vtKey) {
        return res.status(503).json({ error: "VIRUSTOTAL_API_KEY is not configured", code: "MISSING_API_KEY" });
      }

      // Encode URL for VirusTotal v3 API: base64 without padding
      const encodedUrl = Buffer.from(targetUrl).toString('base64').replace(/=/g, '');
      
      const vtRes = await fetch(`https://www.virustotal.com/api/v3/urls/${encodedUrl}`, {
        method: "GET",
        headers: {
          "x-apikey": vtKey
        }
      });

      if (!vtRes.ok) {
        if (vtRes.status === 404) {
          return res.json({ malicious: 0, suspicious: 0, undetected: 0, harmless: 0, total: 0, message: "No data found for this URL in VirusTotal" });
        }
        throw new Error(`VirusTotal API responded with status ${vtRes.status}`);
      }

      const data = await vtRes.json();
      const stats = data.data.attributes.last_analysis_stats;
      
      const total = Object.values(stats).reduce((a: any, b: any) => a + b, 0);

      res.json({
        malicious: stats.malicious || 0,
        suspicious: stats.suspicious || 0,
        undetected: stats.undetected || 0,
        harmless: stats.harmless || 0,
        total: total,
        permalink: `https://www.virustotal.com/gui/url/${encodedUrl}`,
        riskScore: ( (Number(stats.malicious || 0) + Number(stats.suspicious || 0) * 0.5) / Number(total || 1) ) * 100 // Basic heuristic
      });
    } catch (error: any) {
      console.error("Threat Intel Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
