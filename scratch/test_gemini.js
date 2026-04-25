import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    console.log("AI initialized");
    
    const chat = ai.chats.create({
      model: 'models/gemini-2.5-flash',
      systemInstruction: 'You are a helpful assistant.'
    });
    console.log("Chat created");

    const result = await chat.sendMessage({ message: "Salom" });
    console.log("Result received");
    console.log("Text:", result.text);

  } catch (error) {
    console.error("Error:", error);
  }
}

test();
