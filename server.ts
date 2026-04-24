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

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const { urlToAnalyze, lang } = req.body;
      if (!urlToAnalyze) {
        return res.status(400).json({ error: "Missing urlToAnalyze parameter" });
      }

      let _genAI = null;
      try {
        const { GoogleGenAI, Type } = await import("@google/genai");
        _genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A formal, professional intelligence summary of the website/link contents and purpose." },
            riskScore: { type: Type.NUMBER, description: "Risk score from 0 to 100 based on likelihood of malicious intent." },
            riskLevel: { type: Type.STRING, description: "Low, Medium, High, or Critical." },
            domainInfo: {
              type: Type.OBJECT,
              properties: {
                registrar: { type: Type.STRING, description: "The domain registrar." },
                creationDate: { type: Type.STRING, description: "The date the domain was created." },
                serverLocation: { type: Type.STRING, description: "The physical server location or country." }
              }
            },
            ipInfo: {
              type: Type.OBJECT,
              properties: {
                ip: { type: Type.STRING, description: "Resolved IP Address" },
                organization: { type: Type.STRING, description: "Hosting provider or ASN organization" },
                location: { type: Type.STRING, description: "City & Country of the IP" },
                associatedDomains: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Other domains hosted on the same IP" },
                asn: { type: Type.STRING, description: "Autonomous System Number (ASN) details" },
                registrationDate: { type: Type.STRING, description: "IP Address Registration Date/Info" },
                reputationScore: { type: Type.NUMBER, description: "Historical IP reputation score (0-100, 100 being worst)" }
              }
            },
            relatedLinks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  url: { type: Type.STRING },
                  reason: { type: Type.STRING, description: "Why this link is related" }
                }
              },
              description: "Other URLs, subdomains, or external links discovered during investigation"
            },
            flags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Any suspicious indicators, red flags, or notable operational security details."
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Formal recommendations for the investigating officer on what to do next based on this link."
            },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING, description: "Date or time of the event (e.g., '2023-01-15' or 'January 2023')" },
                  title: { type: Type.STRING, description: "A brief, clear title for the event" },
                  description: { type: Type.STRING, description: "More detailed context about the event" },
                  type: { type: Type.STRING, description: "Must be 'registration', 'update', 'social', or 'other'" }
                }
              },
              description: "A chronological timeline of significant events (registration dates, updates, posts, discoveries)."
            },
            socialMediaPosts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING, description: "Name of the social media platform (e.g., Twitter, Facebook, Instagram, TikTok)" },
                  accountHandle: { type: Type.STRING, description: "Username or handle (e.g., @johndoe)" },
                  accountName: { type: Type.STRING, description: "Display name of the account" },
                  postContent: { type: Type.STRING, description: "Extracted text content of the post/tweet/message" },
                  postDate: { type: Type.STRING, description: "Date/time the post was published (if found)" },
                  engagementMetrics: {
                    type: Type.OBJECT,
                    properties: {
                      likes: { type: Type.INTEGER },
                      shares: { type: Type.INTEGER },
                      comments: { type: Type.INTEGER },
                      views: { type: Type.INTEGER }
                    }
                  }
                }
              },
              description: "Information about social media posts/profiles if the target is a social media link"
            }
          }
        };

        const response = await _genAI.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: `You are an AI intelligence assistant for law enforcement. An officer has requested an analysis of the following link: ${urlToAnalyze}. Use Google Search to investigate this target. Present a highly formal, objective, and detailed intelligence report following the response schema. If this is a social media link, extract post details, user information (publicly available), and engagement metrics, and populate 'socialMediaPosts' with a list of relevant posts. Include a chronological timeline of significant events (such as domain registration, latest updates, or social media activity) in the 'timeline' field. The report MUST be written in ${lang === 'th' ? 'Thai' : 'English'} language.`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          }
        });

        const data = JSON.parse(response.text?.trim() || "{}");
        res.json(data);
      } catch (err: any) {
        console.error("Gemini AI API Error:", err);
        return res.status(500).json({ error: "Failed to perform intelligence scan via backend: " + err.message });
      }
    } catch (error: any) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: error.message });
    }
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
