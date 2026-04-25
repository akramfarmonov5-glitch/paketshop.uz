import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testTTS() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { console.error("API Key missing"); return; }

  const ai = new GoogleGenAI({ apiKey });

  console.log("TTS test boshlandi...");

  const response = await ai.models.generateContent({
    model: 'models/gemini-3.1-flash-tts-preview',
    contents: [{ role: 'user', parts: [{ text: 'Assalomu alaykum!' }] }],
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

  console.log("Javob olindi");

  let hasText = false;
  let hasAudio = false;

  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        hasAudio = true;
      }
      if (part.text) {
        console.log("Text:", part.text);
        hasText = true;
      }
    }
  }

  console.log("Has Text:", hasText, "Has Audio:", hasAudio);
}

testTTS().catch(console.error);
