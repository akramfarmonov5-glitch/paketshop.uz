
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, MessageCircle, Mic, PhoneOff, User, Phone, ChevronRight } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Product } from '../types';
import { supabase } from '../lib/supabaseClient';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatAssistantProps {
  products: Product[];
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [formLoading, setFormLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Assalomu alaykum! Men LUXECORE shaxsiy stilistingizman. Sizga qanday yordam bera olaman? Masalan, 'sovg'a uchun soat' yoki 'yozgi sumka' so'rashingiz mumkin." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const currentInputTranscription = useRef<string>('');
  const currentOutputTranscription = useRef<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLive, isRegistered]);

  useEffect(() => {
    const savedUser = localStorage.getItem('luxecore_chat_user');
    if (savedUser) {
      setIsRegistered(true);
      const user = JSON.parse(savedUser);
      setFormData(user);
    }
    return () => {
      disconnectLive();
    };
  }, []);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    localStorage.setItem('luxecore_chat_user', JSON.stringify(formData));

    const env = import.meta.env || {};
    if (env.VITE_SUPABASE_URL) {
      try {
        await supabase.from('leads').insert({
          id: `lead_${Date.now()}`,
          name: formData.name,
          phone: formData.phone,
          created_at: new Date().toISOString()
        });
        console.log('Lead saved successfully');
      } catch (error) {
        console.error("Error saving lead:", error);
      }
    }

    setFormLoading(false);
    setIsRegistered(true);
  };

  const getSystemInstruction = () => {
    const productContext = products.map(p =>
      `- ${p.name} (${p.category}): ${p.formattedPrice}. ${p.shortDescription}`
    ).join('\n');

    return `
      Siz LUXECORE premium do'konining professional sotuvchi-konsultanti va stilistisiz.
      Mijozingizning ismi: ${formData.name}. Unga ismi bilan murojaat qiling.
      Siz xushmuomala, "siz"lab va o'zbek tilida gaplashing.
      
      Bizdagi mavjud mahsulotlar ro'yxati:
      ${productContext}

      Qoidalaringiz:
      1. Faqat yuqoridagi ro'yxatdagi mahsulotlarni tavsiya qiling.
      2. Agar mijoz umumiy savol bersa (masalan, "soat kerak"), ro'yxatdagi mos mahsulotni narxi va afzalligi bilan taklif qiling.
      3. Javoblaringiz qisqa (maksimum 3 gap), lo'nda va sotuvga yo'naltirilgan bo'lsin.
      4. Narxlarni so'rashsa, ro'yxatdagidek aniq ayting.
    `;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const env = import.meta.env || {};
      const apiKey = env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'model', text: "Kechirasiz, AI tizimi hozircha mavjud emas (API Key topilmadi)." }]);
        setIsLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash-preview-09-2025',
        config: {
          systemInstruction: getSystemInstruction(),
        }
      });

      const response = await chat.sendMessage({ message: userMessage });

      const text = response.text || "Uzr, tushunmadim. Qayta so'ray olasizmi?";

      setMessages(prev => [...prev, { role: 'model', text }]);

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Kechirasiz, tizimda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const connectLive = async () => {
    const env = import.meta.env || {};
    const apiKey = env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'model', text: "⚠️ API kalit topilmadi." }]);
      return;
    }

    setIsLive(true);
    setMessages(prev => [...prev, { role: 'model', text: "📞 Ovozli aloqa o'rnatilmoqda..." }]);

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: getSystemInstruction(),
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log("Live session connected");

            if (!inputAudioContextRef.current || !streamRef.current) return;

            const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);

              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

              try {
                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  ctx,
                  24000,
                  1
                );

                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);

                source.addEventListener('ended', () => {
                  sourceNodesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourceNodesRef.current.add(source);
              } catch (e) {
                console.error("Audio decode error", e);
              }
            }

            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              if (currentInputTranscription.current.trim()) {
                setMessages(prev => [...prev, { role: 'user', text: currentInputTranscription.current }]);
                currentInputTranscription.current = '';
              }
              if (currentOutputTranscription.current.trim()) {
                setMessages(prev => [...prev, { role: 'model', text: currentOutputTranscription.current }]);
                currentOutputTranscription.current = '';
              }
            }

            if (message.serverContent?.interrupted) {
              sourceNodesRef.current.forEach(node => node.stop());
              sourceNodesRef.current.clear();
              nextStartTimeRef.current = 0;
              currentOutputTranscription.current = '';
            }
          },
          onclose: () => {
            console.log("Live session closed");
            disconnectLive();
          },
          onerror: (err) => {
            console.error("Live session error", err);
            disconnectLive();
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error("Failed to connect live", e);
      setIsLive(false);
      setMessages(prev => [...prev, { role: 'model', text: "⚠️ Ovozli aloqaga ulanib bo'lmadi." }]);
    }
  };

  const disconnectLive = () => {
    setIsLive(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }

    if (sessionRef.current) {
      sessionRef.current.then((session: any) => {
        if (session.close) session.close();
      }).catch(() => { });
      sessionRef.current = null;
    }

    sourceNodesRef.current.clear();
  };

  function createBlob(data: Float32Array): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[80] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-dark-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-gold-600/10 to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
                  <Sparkles size={20} className="text-black" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">LUXE Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-green-500'} `}></span>
                    <span className="text-xs text-gray-400">{isLive ? 'Voice Live' : 'Online | Gemini AI'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isRegistered && (
                  <button
                    onClick={isLive ? disconnectLive : connectLive}
                    className={`p-2 rounded-full transition-colors ${isLive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                    title={isLive ? "Tugatish" : "Ovozli suhbat"}
                  >
                    {isLive ? <PhoneOff size={20} /> : <Mic size={20} />}
                  </button>
                )}
                <button
                  onClick={() => {
                    disconnectLive();
                    setIsOpen(false);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {!isRegistered ? (
              <div className="flex-1 p-6 flex flex-col justify-center">
                <div className="text-center mb-8">
                  <h4 className="text-xl font-bold text-white mb-2">Xush kelibsiz!</h4>
                  <p className="text-gray-400 text-sm">Shaxsiy yordamchingizdan foydalanish uchun ma'lumotlaringizni kiriting.</p>
                </div>

                <form onSubmit={handleRegistration} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gold-400 font-medium ml-1">Ismingiz</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold-400 focus:outline-none"
                        placeholder="Ismingizni kiriting"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gold-400 font-medium ml-1">Telefon raqam</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <span className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400">+998</span>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-xl pl-24 pr-4 py-3 text-white focus:border-gold-400 focus:outline-none"
                        placeholder="90 123 45 67"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-gold-400 text-black font-bold py-3.5 rounded-xl hover:bg-gold-500 transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                    {formLoading ? (
                      <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                    ) : (
                      <>
                        Boshlash <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </form>
                <p className="text-xs text-gray-600 text-center mt-6">
                  Ma'lumotlaringiz xavfsizligi kafolatlangan.
                </p>
              </div>
            ) : (
              <>
                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20"
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                          ? 'bg-gold-500 text-black font-medium rounded-tr-sm'
                          : 'bg-white/10 text-gray-200 rounded-tl-sm border border-white/5'
                          }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && !isLive && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 p-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  )}
                  {isLive && (
                    <div className="flex justify-center py-4">
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-3 bg-gold-400 animate-[pulse_1s_ease-in-out_infinite]"></span>
                        <span className="w-1 h-5 bg-gold-400 animate-[pulse_1.1s_ease-in-out_infinite]"></span>
                        <span className="w-1 h-8 bg-gold-400 animate-[pulse_1.2s_ease-in-out_infinite]"></span>
                        <span className="w-1 h-5 bg-gold-400 animate-[pulse_1.3s_ease-in-out_infinite]"></span>
                        <span className="w-1 h-3 bg-gold-400 animate-[pulse_1.4s_ease-in-out_infinite]"></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/10 bg-dark-900/50">
                  {isLive ? (
                    <div className="flex items-center justify-center gap-3 text-sm text-gold-400">
                      <Mic className="animate-pulse" size={16} />
                      <span>Tinglanmoqda...</span>
                    </div>
                  ) : (
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Masalan: Menga soat kerak..."
                        className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/50 transition-all placeholder:text-gray-600"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2 bg-gold-400 text-black rounded-full hover:bg-gold-500 disabled:opacity-50 disabled:hover:bg-gold-400 transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:shadow-[0_0_50px_rgba(251,191,36,0.5)] transition-shadow"
      >
        <AnimatePresence mode='wait'>
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={28} className="text-black" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={28} className="text-black fill-black/10" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && !isRegistered && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-pulse"></span>
        )}
      </motion.button>
    </div>
  );
};

export default AIChatAssistant;
