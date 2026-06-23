const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY");
}

let aiClient = null;
try {
  aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
} catch(e) {
  console.error("Failed to init Gemini:", e.message);
}

async function generateStructuredText(prompt, original) {
  if (!aiClient) throw new Error("AI not configured");
  
  const finalPrompt = prompt + `
Return ONLY valid JSON with this exact structure:
{
  "original": ${JSON.stringify(original)},
  "improved": "<improved version>",
  "explanation": "<brief explanation of changes>"
}`;
  
  const response = await aiClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: finalPrompt,
    config: {
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text);
}

async function correctMessage(message) {
  const prompt = `Fix grammar, spelling, and basic formatting for this WhatsApp message. Do not change the tone or meaning.
Message: ${message}`;
  return await generateStructuredText(prompt, message);
}

async function changeTone(message, tone) {
  const prompt = `Rewrite the following WhatsApp message to have a '${tone}' tone. Ensure it remains suitable for a WhatsApp broadcast.
Message: ${message}`;
  return await generateStructuredText(prompt, message);
}

async function improveMessage(message) {
  const prompt = `Improve the following WhatsApp campaign message. Make it highly engaging, clear, and professional while retaining the core intent.
Message: ${message}`;
  return await generateStructuredText(prompt, message);
}

async function reviewCampaign(message) {
  const prompt = `Analyze this WhatsApp campaign message and provide a review.
Return ONLY valid JSON with this exact structure:
{
  "qualityScore": <number 0-10>,
  "spamRisk": "<Low/Medium/High>",
  "readability": "<Low/Medium/High>",
  "personalization": "<Poor/Fair/Good/Excellent>",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."]
}
Message: ${message}`;
  if (!aiClient) throw new Error("AI not configured");
  const response = await aiClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text);
}

module.exports = { correctMessage, changeTone, improveMessage, reviewCampaign };
