/**
 * Vite Plugin: Local API Handler
 * Vercel serverless funksiyalarini lokal development da ishlashi uchun
 * /api/gemini endpointini Vite dev server orqali handle qiladi
 */
import type { Plugin } from 'vite';

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

export function viteApiPlugin(): Plugin {
  return {
    name: 'vite-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/gemini' && req.method === 'POST') {
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(chunk as Buffer);
            }
            const body = JSON.parse(Buffer.concat(chunks).toString());

            const { message, history, systemInstruction, jsonMode } = body;

            if (!message) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Message content is required' }));
              return;
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY .env.local da topilmadi' }));
              return;
            }

            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey });

            // 1. Matn generatsiyasi
            const chat = ai.chats.create({
              model: 'models/gemini-3-flash-preview',
              config: {
                systemInstruction,
                ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
              },
              history: history && history.length > 0 ? history : undefined,
            });

            const textResult = await chat.sendMessage({ message });
            const text = textResult.text || "Uzr, tushunmadim. Qayta so'ray olasizmi?";

            // 2. TTS generatsiyasi
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
                        voiceName: 'Puck'
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
              console.error("Vite TTS Error:", ttsError);
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text, audioBase64 }));
          } catch (error: any) {
            console.error('Vite API Plugin Error:', error?.message || error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error?.message || 'Internal Server Error' }));
          }
          return;
        }

        next();
      });
    },
  };
}
