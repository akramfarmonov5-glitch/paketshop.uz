
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, MessageCircle, User, Phone, ChevronRight, Mic, MicOff, Volume2, Headphones } from 'lucide-react';
import { Product } from '../types';
import { getLocalizedText } from '../lib/i18nUtils';
import { useLanguage } from '../context/LanguageContext';

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
  const [formStartedAt] = useState(() => Date.now());

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Assalomu alaykum! Men PaketShop onlayn do'koni yordamchisiman. Sizga qanday yordam bera olaman? Masalan, 'qanday paketlar bor' yoki 'konteyner narxini ayt' deb so'rashingiz mumkin." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { lang } = useLanguage();

  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isVoiceModeRef = useRef(false);
  const isPlayingAudioRef = useRef(false);
  const isLoadingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync refs to avoid speech recognition closure issues
  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);

  useEffect(() => {
    isPlayingAudioRef.current = isPlayingAudio;
  }, [isPlayingAudio]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Helper methods to safely start/stop recognition
  const startRecognition = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.lang = lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US';
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Speech recognition start warning:", e);
    }
  };

  const stopRecognition = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.warn("Speech recognition stop warning:", e);
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsListening(true);
      };
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          if (isVoiceModeRef.current) {
            handleSendRef.current?.(transcript);
          } else {
            setInput(prev => prev ? `${prev} ${transcript}` : transcript);
          }
        }
      };
      
      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      
      rec.onend = () => {
        setIsListening(false);
        // If we are in voice mode and NOT playing audio and NOT loading, restart listening so the user can speak
        if (isVoiceModeRef.current && !isPlayingAudioRef.current && !isLoadingRef.current) {
          setTimeout(() => {
            if (isVoiceModeRef.current && !isPlayingAudioRef.current && !isLoadingRef.current) {
              startRecognition();
            }
          }, 300);
        }
      };
      
      recognitionRef.current = rec;
    }
  }, [lang]);

  // Voice mode toggle effects
  useEffect(() => {
    if (isVoiceMode) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlayingAudio(false);
      startRecognition();
    } else {
      stopRecognition();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlayingAudio(false);
    }
  }, [isVoiceMode]);

  useEffect(() => {
    if (!isOpen) {
      setIsVoiceMode(false);
      stopRecognition();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Kechirasiz, ushbu brauzerda ovozli kiritish qo'llab-quvvatlanmaydi.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      startRecognition();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isRegistered]);

  useEffect(() => {
    const savedUser = (typeof window !== 'undefined' ? localStorage.getItem('paketshop_chat_user') : null);
    if (savedUser) {
      setIsRegistered(true);
      const user = JSON.parse(savedUser);
      setFormData(user);
    }
  }, []);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    localStorage.setItem('paketshop_chat_user', JSON.stringify(formData));

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chat',
          name: formData.name,
          phone: formData.phone,
          note: "Mijoz AI chat yordamchisi bilan suhbat boshladi",
          website: '',
          startedAt: formStartedAt,
        }),
      });
      if (!response.ok) throw new Error('Lead request failed');
    } catch (leadError) {
      console.error("Lead registration error:", leadError);
    }

    setFormLoading(false);
    setIsRegistered(true);
  };

  const getSystemInstruction = () => {
    const productContext = products.map(p =>
      `- ${getLocalizedText(p.name, 'uz')} (${getLocalizedText(p.category, 'uz')}): ${p.formattedPrice}. ${getLocalizedText(p.shortDescription, 'uz') || ''}`
    ).join('\n');

    return `
      Siz PaketShop onlayn do'konining yuqori malakali, xushmuomala va samimiy sotuvchi-konsultantisiz.
      Mijozingizning ismi: ${formData.name}. Unga hurmat bilan, ismi orqali murojaat qiling.
      Muloqot tili: O'zbek tili. Mijoz bilan doimo "siz"lab, juda do'stona va iliq ohangda gaplashing.
      
      Bizdagi mavjud mahsulotlar va katalog ma'lumotlari:
      ${productContext}

      Sizning asosiy vazifalaringiz va qoidalaringiz:
      1. Faqat yuqorida ko'rsatilgan mahsulotlarni tavsiya qiling va ular haqida ma'lumot bering. Do'konda yo'q mahsulotlarni to'qib chiqarmang.
      2. Javoblaringiz juda qisqa, aniq va lutfan boy bo'lsin (1-2 gapdan oshmasin). Mijoz ko'p matn o'qishni yoqtirmaydi, oddiy va jonli insondek yozing.
      3. Hech qachon *, **, #, -, [ ], ( ) kabi markdown belgilarini ishlatmang. Faqat toza matn yozing, chunki bu matn ovozli (TTS) o'qiladi!
      4. Mijoz biror mahsulot narxini yoki xususiyatini so'rasa, narxlarni aniq va to'liq ko'rsatib bering.
      5. Aqlli sotuvchi (Cross-selling/Up-selling) bo'ling: Masalan, agar mijoz paket so'rasa, unga mos keladigan boshqa bir martalik idishlar yoki konteynerlarni ham muloyimlik bilan taklif qiling.
      6. Do'stona, tabiiy va hayotiy gaplashing. Har bir javobingiz mijozga yordam berish istagingizni ko'rsatib tursin.
    `;
  };

  const handleSend = async (overrideText?: string | React.MouseEvent) => {
    const userMessage = (overrideText && typeof overrideText === 'string') ? overrideText : input;
    if (!userMessage.trim()) return;

    if (typeof overrideText !== 'string') {
      setInput('');
    }
    const newMessages: Message[] = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = newMessages.slice(1, -1).map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: history,
          systemInstruction: getSystemInstruction(),
          voiceMode: isVoiceMode
        })
      });

      if (!response.ok) {
        let errMsg = 'Server xatosi';
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch {
          errMsg = `Server javob bermadi (Status: ${response.status})`;
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      
      if (data.audioBase64) {
        try {
          const audio = new Audio('data:audio/wav;base64,' + data.audioBase64);
          audioRef.current = audio;
          setIsPlayingAudio(true);
          
          audio.onended = () => {
            setIsPlayingAudio(false);
            audioRef.current = null;
            if (isVoiceModeRef.current) {
              startRecognition();
            }
          };

          audio.onerror = () => {
            setIsPlayingAudio(false);
            audioRef.current = null;
            if (isVoiceModeRef.current) {
              startRecognition();
            }
          };

          audio.play().catch(e => {
            console.error("Audio play error:", e);
            setIsPlayingAudio(false);
            audioRef.current = null;
            if (isVoiceModeRef.current) {
              startRecognition();
            }
          });
        } catch (e) {
          console.error("Audio element error:", e);
          setIsPlayingAudio(false);
          if (isVoiceModeRef.current) {
            startRecognition();
          }
        }
      } else {
        if (isVoiceModeRef.current) {
          startRecognition();
        }
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: `Kechirasiz, xatolik yuz berdi: ${error.message || error}` }]);
      if (isVoiceModeRef.current) {
        startRecognition();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // fresh ref for stale closure safeguard
  const handleSendRef = useRef<any>(null);
  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

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
                  <h3 className="text-white font-bold text-sm">PaketShop Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-gray-400">Online | Gemini AI</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isRegistered && (
                  <button
                    onClick={() => setIsVoiceMode(!isVoiceMode)}
                    className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center relative ${
                      isVoiceMode
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg shadow-red-500/30 ring-2 ring-red-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={isVoiceMode ? "Ovozli rejimni o'chirish" : "Hands-free Ovozli rejimni yoqish"}
                  >
                    {isVoiceMode ? <Mic className="animate-bounce" size={18} /> : <MicOff size={18} />}
                    {isVoiceMode && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-black animate-ping"></span>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
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
                {isVoiceMode ? (
                  /* Premium Voice Call Overlay Visualizer */
                  <div className="flex-1 bg-gradient-to-b from-dark-950 to-black flex flex-col items-center justify-between p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08)_0%,transparent_60%)] pointer-events-none blur-xl"></div>
                    
                    <div className="text-center z-10 mt-2">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-gold-400 font-black uppercase tracking-widest animate-pulse">
                        {isPlayingAudio ? "Javob berilmoqda" : isLoading ? "Fikrlanmoqda" : isListening ? "Eshitilmoqda" : "Kutilmoqda"}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center z-10 my-auto gap-6 w-full">
                      <div className="relative flex items-center justify-center">
                        {(isPlayingAudio || isListening || isLoading) && (
                          <>
                            <div className={`absolute w-36 h-36 rounded-full border border-gold-400/30 animate-ping duration-1000 ${isLoading ? 'border-dashed' : ''}`}></div>
                            <div className={`absolute w-44 h-44 rounded-full border border-gold-500/20 animate-ping duration-1500 delay-300 ${isLoading ? 'border-dashed' : ''}`}></div>
                            <div className={`absolute w-52 h-52 rounded-full border border-gold-600/10 animate-ping duration-2000 delay-700 ${isLoading ? 'border-dashed' : ''}`}></div>
                          </>
                        )}
                        
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.3)] transition-all duration-500 relative z-20 ${
                          isPlayingAudio ? 'scale-110 shadow-[0_0_50px_rgba(251,191,36,0.5)]' : isListening ? 'scale-105 ring-4 ring-green-500/30 animate-pulse' : isLoading ? 'animate-spin duration-3000' : ''
                        }`}>
                          {isPlayingAudio ? (
                            <Volume2 size={32} className="text-black animate-bounce" />
                          ) : isListening ? (
                            <Mic size={32} className="text-black" />
                          ) : isLoading ? (
                            <Sparkles size={32} className="text-black" />
                          ) : (
                            <Headphones size={32} className="text-black" />
                          )}
                        </div>
                      </div>

                      <div className="text-center max-w-[280px] space-y-2">
                        <p className="text-white text-sm font-bold px-4 leading-relaxed max-h-[110px] overflow-y-auto custom-scrollbar">
                          {isPlayingAudio 
                            ? messages[messages.length - 1]?.text 
                            : isLoading 
                              ? "PaketShop o'ylamoqda..." 
                              : isListening 
                                ? (input || "Sizni eshitayapman, gapiring...") 
                                : "Gapirishni boshlang..."
                          }
                        </p>
                        {isListening && input && (
                          <p className="text-[11px] text-gray-500 italic">"{input}"</p>
                        )}
                      </div>
                    </div>

                    <div className="w-full flex flex-col items-center gap-3 z-10 mb-2">
                      <button
                        onClick={() => setIsVoiceMode(false)}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-gray-400 hover:text-white transition-all font-bold"
                      >
                        Matnli chatga qaytish
                      </button>
                      <p className="text-[9px] text-gray-600 font-medium">
                        Qo'llarsiz (Hands-free) rejim faol.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Standard Text Mode Chat */
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
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white/5 p-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-white/10 bg-dark-900/50">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Xabaringizni yozing..."
                          className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-24 py-3.5 text-sm text-white focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/50 transition-all placeholder:text-gray-600"
                        />
                        <button
                          onClick={toggleListening}
                          className={`absolute right-12 p-2 rounded-full transition-all duration-300 ${
                            isListening
                              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                              : 'text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                          title="Ovozli kiritish"
                        >
                          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                        </button>
                        <button
                          onClick={handleSend}
                          disabled={!input.trim() || isLoading}
                          className="absolute right-2 p-2 bg-gold-400 text-black rounded-full hover:bg-gold-500 disabled:opacity-50 disabled:hover:bg-gold-400 transition-colors"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
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
