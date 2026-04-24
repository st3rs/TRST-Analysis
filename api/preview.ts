import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    const _genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Website title or entity name." },
        category: { type: Type.STRING, description: "Broad category (e.g. E-Commerce, Social Media, Forum, Suspicious)." },
        snippet: { type: Type.STRING, description: "A concise 1-2 sentence preview or known meta description." }
      }
    };

    const response = await _genAI.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Fetch a quick preview/metadata for the website: ${url}. Use Google Search to find its title and context. Keep it brief.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    let text = response.text?.trim() || "{}";
    if (text.startsWith("\`\`\`json")) text = text.slice(7, -3).trim();
    if (text.startsWith("\`\`\`")) text = text.slice(3, -3).trim();

    const firstBrace = text.indexOf('{');
    if (firstBrace !== -1 && !text.startsWith('{')) {
      const lastBrace = text.lastIndexOf('}');
      if (lastBrace > firstBrace) text = text.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Vercel Preview Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
