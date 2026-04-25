import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testTTSBoth() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'models/gemini-3.1-flash-tts-preview',
      contents: 'Translate "Hello" to Uzbek',
      config: {
        responseModalities: ['TEXT', 'AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Puck'
            }
          }
        }
      }
    });

    console.log("Parts array length:", response.candidates[0].content.parts.length);
    for (const part of response.candidates[0].content.parts) {
      console.log("Part keys:", Object.keys(part));
      if (part.text) console.log("Text content:", part.text);
      if (part.inlineData) console.log("Audio found! MIME:", part.inlineData.mimeType);
    }
  } catch(e) {
    console.error("Error:", e);
  }
}

testTTSBoth();
