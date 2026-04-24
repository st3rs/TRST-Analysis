export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
        return res.status(200).json({ malicious: 0, suspicious: 0, undetected: 0, harmless: 0, total: 0, message: "No data found for this URL in VirusTotal" });
      }
      throw new Error(`VirusTotal API responded with status ${vtRes.status}`);
    }

    const data = await vtRes.json();
    const stats = data.data.attributes.last_analysis_stats;
      
    const total = Object.values(stats).reduce((a: any, b: any) => a + b, 0);

    return res.status(200).json({
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      undetected: stats.undetected || 0,
      harmless: stats.harmless || 0,
      total: total,
      permalink: `https://www.virustotal.com/gui/url/${encodedUrl}`,
      riskScore: ( (Number(stats.malicious || 0) + Number(stats.suspicious || 0) * 0.5) / Number(total || 1) ) * 100
    });
  } catch (error: any) {
    console.error("Vercel Threat Intel Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
