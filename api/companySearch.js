
// api/companySearch.js

export default async function handler(req, res) {
  try {
    const q = (req.query.query || "").trim();

    // No text → no suggestions
    if (!q) {
      return res.status(200).json({ companies: [] });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        companies: [],
        error: "Missing OPENAI_API_KEY"
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: `List exactly 5 companies that are similar to "${q}". Only output the company names, one per line, no numbering, no extra words.`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({
        companies: [],
        error: data.error?.message || "OpenAI API error"
      });
    }

    const rawText = data.choices?.[0]?.message?.content || "";

    const companies = rawText
      .split("\n")
      .map((c) => c.trim().replace(/^[-•\d.]+\s*/, ""))
      .filter((c) => c);

    return res.status(200).json({ companies });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      companies: [],
      error: "Server error"
    });
  }
}
