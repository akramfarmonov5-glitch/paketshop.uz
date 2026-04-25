import { GoogleGenAI } from "@google/genai";
import { writeFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

function createWavHeader(dataLength, sampleRate = 24000) {
  const buffer = Buffer.alloc(44);
  
  // "RIFF" chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  
  // "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(1, 22); // NumChannels (1 mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(2, 32); // BlockAlign (NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  
  // "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  
  return buffer;
}

async function testTTS() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { console.error("API Key missing"); return; }

  const ai = new GoogleGenAI({ apiKey });

  console.log("TTS test boshlandi...");

  const response = await ai.models.generateContent({
    model: 'models/gemini-3.1-flash-tts-preview', // User requested 3.1
    contents: [{ role: 'user', parts: [{ text: 'Assalomu alaykum! Men o\'zbek tilida bemalol gapira olaman.' }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Puck' // Aoede, Charon, Fenrir, Kore, Puck
          }
        }
      }
    }
  });

  console.log("Javob olindi");

  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        console.log("Audio topildi! MIME:", part.inlineData.mimeType);
        const pcmBuffer = Buffer.from(part.inlineData.data, 'base64');
        const wavHeader = createWavHeader(pcmBuffer.length, 24000);
        const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
        
        writeFileSync('scratch/test_output.wav', wavBuffer);
        console.log("Audio saqlandi: scratch/test_output.wav, hajmi:", wavBuffer.length, "bytes");
      }
      if (part.text) {
        console.log("Text:", part.text);
      }
    }
  } else {
    console.log("Javob tuzilishi:", JSON.stringify(response, null, 2).substring(0, 500));
  }
}

testTTS().catch(console.error);
