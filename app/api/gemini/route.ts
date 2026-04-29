import { NextRequest, NextResponse } from 'next/server';

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts';

// ... Rate limiting and WAV header functions omitted for brevity in this step, but in practice I would copy them fully.
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

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key is missing on server' }, { status: 500 });
  }

  try {
    const { message, history, systemInstruction, jsonMode } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    
    // 1. Text generation
    const chat = ai.chats.create({
      model: TEXT_MODEL,
      config: {
        systemInstruction,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
      history: history && history.length > 0 ? history : undefined
    });

    const textResult = await chat.sendMessage({ message });
    const text = textResult.text || "Uzr, tushunmadim. Qayta so'ray olasizmi?";

    // 2. TTS Generation
    let audioBase64 = null;
    try {
      const audioResponse = await ai.models.generateContent({
        model: TTS_MODEL,
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
      console.error("TTS Generation Error:", ttsError);
    }

    return NextResponse.json({ text, audioBase64 });
  } catch (error: any) {
    console.error("Gemini API Error:", error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
