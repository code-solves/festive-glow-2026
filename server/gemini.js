import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load env files: prefer .env.local, then fallback to .env
const loadLocalEnv = () => {
  let loaded = null;
  try {
    loaded = dotenv.config({ path: ".env.local" });
    if (loaded && loaded.parsed && Object.keys(loaded.parsed).length > 0)
      return ".env.local";
  } catch (e) {
    // ignore
  }
  try {
    loaded = dotenv.config();
    if (loaded && loaded.parsed && Object.keys(loaded.parsed).length > 0)
      return ".env";
  } catch (e) {
    // ignore
  }
  return null;
};

const loadedEnvFile = loadLocalEnv();
if (loadedEnvFile) {
  console.log(`Loaded environment from ${loadedEnvFile}`);
} else {
  console.log("No .env file loaded");
}

const app = express();
app.use(express.json());

app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ text });
  } catch (err) {
    console.error("Gemini error:", err);
    const isProd = process.env.NODE_ENV === "production";
    // In dev, include error message to help debugging. Do NOT expose in production.
    if (!isProd) {
      return res.status(500).json({
        error: "Gemini request failed",
        detail: String(err?.message || err),
      });
    }
    return res.status(500).json({ error: "Gemini request failed" });
  }
});

const PORT = process.env.PORT || 5174;
console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
// If API key is present, query the Generative Language ListModels endpoint
// to discover supported models for your project.
const upstreamApiKey = process.env.GEMINI_API_KEY;

(async () => {
  if (upstreamApiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(
        upstreamApiKey
      )}`;
      const r = await fetch(url, { method: "GET" });
      if (!r.ok) {
        console.error("ListModels request failed:", r.status, await r.text());
      } else {
        const info = await r.json();
        const modelNames = (info.models || []).map(
          (m) =>
            m.name +
            (m.supportedMethods ? ` (${m.supportedMethods.join(",")})` : "")
        );
        console.log(
          "Available generative models:",
          modelNames.length ? modelNames : info
        );
      }
    } catch (err) {
      console.error("ListModels error:", err);
    }
  }

  app.listen(PORT, () => {
    console.log(`Gemini API running at http://localhost:${PORT}`);
  });
})();
