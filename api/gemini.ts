import { GoogleGenAI } from "@google/genai";

function createWavHeader(dataLength: number, sampleRate = 24000) {
  const buffer = Buffer.alloc(44);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  return buffer;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is missing on server' });
  }

  try {
    const { message, history, systemInstruction, jsonMode } = req.body || {};
    
    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // 1. Matnni generatsiya qilish
    const chat = ai.chats.create({
      model: 'models/gemini-3-flash-preview',
      config: {
        systemInstruction,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
      history: history && history.length > 0 ? history : undefined
    });

    const textResult = await chat.sendMessage({ message });
    const text = textResult.text || "Uzr, tushunmadim. Qayta so'ray olasizmi?";

    // 2. TTS orqali audioni generatsiya qilish (gemini-3.1-flash-tts-preview)
    let audioBase64 = null;
    try {
      const audioResponse = await ai.models.generateContent({
        model: 'models/gemini-3.1-flash-tts-preview',
        contents: [{ role: 'user', parts: [{ text: text }] }],
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

      const candidate = audioResponse.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const pcmBuffer = Buffer.from(part.inlineData.data, 'base64');
            const wavHeader = createWavHeader(pcmBuffer.length, 24000);
            const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
            audioBase64 = wavBuffer.toString('base64');
            break;
          }
        }
      }
    } catch (ttsError) {
      console.error("TTS Generation Error:", ttsError);
      // TTS xato bo'lsa ham matnni qaytaramiz
    }

    return res.status(200).json({ text, audioBase64 });
  } catch (error: any) {
    console.error("Gemini API Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || 'Internal Server Error' });
  }
}
