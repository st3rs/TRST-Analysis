import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  try {
    const { urlToAnalyze, lang } = req.body;
    if (!urlToAnalyze) {
      return res.status(400).json({ error: "Missing urlToAnalyze parameter" });
    }

    const _genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
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

    let text = response.text?.trim() || "{}";
    if (text.startsWith("\`\`\`json")) text = text.slice(7, -3).trim();
    if (text.startsWith("\`\`\`")) text = text.slice(3, -3).trim();
    
    // Safety fallback parsing
    const firstBrace = text.indexOf('{');
    if (firstBrace !== -1 && !text.startsWith('{')) {
      const lastBrace = text.lastIndexOf('}');
      if (lastBrace > firstBrace) text = text.substring(firstBrace, lastBrace + 1);
    }
    
    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Vercel Analyze Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
