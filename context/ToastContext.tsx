'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  error: 'bg-red-500/15 border-red-500/30 text-red-400',
  warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  info: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
};

const ICON_BG: Record<ToastType, string> = {
  success: 'bg-emerald-500/20',
  error: 'bg-red-500/20',
  warning: 'bg-amber-500/20',
  info: 'bg-blue-500/20',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '420px' }}>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${TOAST_STYLES[toast.type]}`}
            style={{
              animation: 'toast-slide-in 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
            }}
          >
            <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${ICON_BG[toast.type]}`}>
              {TOAST_ICONS[toast.type]}
            </div>
            <p className="flex-1 text-sm font-medium leading-relaxed pt-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes toast-slide-in {
          0% {
            opacity: 0;
            transform: translateX(100%) scale(0.85);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};