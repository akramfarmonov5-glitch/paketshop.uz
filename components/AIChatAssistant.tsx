
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, MessageCircle, User, Phone, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { hasSupabaseCredentials, supabase } from '../lib/supabaseClient';
import { getLocalizedText } from '../lib/i18nUtils';

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
    { role: 'model', text: "Assalomu alaykum! Men PaketShop onlayn do'koni yordamchisiman. Sizga qanday yordam bera olaman? Masalan, 'qanday paketlar bor' yoki 'konteyner narxini ayt' deb so'rashingiz mumkin." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isRegistered]);

  useEffect(() => {
    const savedUser = localStorage.getItem('paketshop_chat_user');
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

    if (hasSupabaseCredentials) {
      try {
        await supabase.from('leads').insert({
          id: `lead_${Date.now()}`,
          name: formData.name,
          phone: formData.phone,
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error saving lead:", error);
      }
    }

    setFormLoading(false);
    setIsRegistered(true);
  };

  const getSystemInstruction = () => {
    const productContext = products.map(p =>
      `- ${getLocalizedText(p.name, 'uz')} (${getLocalizedText(p.category, 'uz')}): ${p.formattedPrice}. ${getLocalizedText(p.shortDescription, 'uz')}`
    ).join('\n');

    return `
      Siz PaketShop onlayn do'konining sotuvchi-konsultantisiz.
      Mijozingizning ismi: ${formData.name}. Unga ismi bilan murojaat qiling.
      Siz xushmuomala, "siz"lab va o'zbek tilida gaplashing.
      
      Bizdagi mavjud mahsulotlar:
      ${productContext}

      Qoidalaringiz:
      1. Faqat yuqoridagi mahsulotlarni tavsiya qiling.
      2. Javoblaringiz juda qisqa bo'lsin, 1-2 gap yetarli. Oddiy inson kabi yozing.
      3. Hech qachon *, **, #, - kabi belgilar ishlatmang. Faqat oddiy matn yozing, markdown formatlamasdan.
      4. Narxlarni so'rashsa, aniq ayting.
      5. Do'stona va tabiiy gaplashing, robot kabi emas.
    `;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
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
          systemInstruction: getSystemInstruction()
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
          audio.play().catch(e => console.error("Audio play error:", e));
        } catch (e) {
          console.error("Audio element error:", e);
        }
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: `Kechirasiz, xatolik yuz berdi: ${error.message || error}` }]);
    } finally {
      setIsLoading(false);
    }
  };

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
              <div className="flex gap-2">
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
