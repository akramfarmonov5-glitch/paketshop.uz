import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is missing on server' });
  }

  try {
    const { message, history, systemInstruction } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
      history: history && history.length > 0 ? history : undefined
    });

    const response = await chat.sendMessage({ message });
    const text = response.text || "Uzr, tushunmadim. Qayta so'ray olasizmi?";

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
