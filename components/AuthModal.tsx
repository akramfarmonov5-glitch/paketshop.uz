import React, { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error, data } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    full_name: email.split('@')[0]
                }
            }
        });
        if (error) throw error;
        if (data.session) {
            onClose();
        } else {
            setMessage("Ro'yxatdan o'tdingiz! Iltimos, email pochtangizni tasdiqlang.");
        }
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          {isLogin ? 'Tizimga kirish' : "Ro'yxatdan o'tish"}
        </h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 dark:bg-green-500/10 text-green-500 p-3 rounded-lg text-sm mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-black dark:text-white focus:border-gold-500 focus:outline-none transition-colors"
                placeholder="misol@gmail.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600 dark:text-gray-400">Parol</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-black dark:text-white focus:border-gold-500 focus:outline-none transition-colors"
                placeholder="Kamida 6 ta belgi"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-400 hover:bg-gold-500 text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Kirish' : "Ro'yxatdan o'tish")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? "Akkauntingiz yo'qmi?" : "Allaqachon akkauntingiz bormi?"}{' '}
          <button
            onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
            }}
            className="text-gold-500 font-bold hover:underline"
          >
            {isLogin ? "Ro'yxatdan o'tish" : "Kirish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
