import React, { useState } from 'react';
import { ArrowLeft, Loader2, Lock, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';

interface AdminLoginProps {
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (!result?.ok) throw new Error('Email yoki parol noto‘g‘ri, yoxud akkaunt faol emas.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kirishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm"
        >
          <ArrowLeft size={16} /> Bosh sahifaga qaytish
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-4">
            <Lock size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Kirish</h2>
          <p className="text-slate-500 text-sm mt-2 text-center">
            Faqat PaketShop RBAC roli berilgan akkauntlar kirishi mumkin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-500 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 focus:border-red-600 focus:outline-none"
                placeholder="admin@paketshop.uz"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-500 block">Parol</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 focus:border-red-600 focus:outline-none"
                placeholder="Parolingizni kiriting"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-black font-bold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
