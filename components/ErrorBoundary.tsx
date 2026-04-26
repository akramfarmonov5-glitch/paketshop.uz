import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRecovering: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isRecovering: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRecovering: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    if (this.isChunkLoadError(error) && sessionStorage.getItem('paketshop_chunk_recovered') !== '1') {
      sessionStorage.setItem('paketshop_chunk_recovered', '1');
      this.clearCachesAndReload();
    }
  }

  private isChunkLoadError = (error: Error) => {
    const message = `${error?.name || ''} ${error?.message || ''}`;
    return /ChunkLoadError|Loading chunk|dynamically imported module|module script/i.test(message);
  };

  private clearCachesAndReload = async () => {
    this.setState({ isRecovering: true });

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      }

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
    } catch (cacheError) {
      console.warn('Cache recovery failed:', cacheError);
    } finally {
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8">
             <AlertTriangle className="text-red-500" size={48} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Texnik xatolik yuz berdi
          </h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            {this.state.isRecovering
              ? 'Yangi versiya yuklanmoqda. Sahifa bir necha soniyada avtomatik yangilanadi.'
              : "Kechirasiz, tizimda kutilmagan nosozlik kuzatildi. Iltimos, sahifani yangilang yoki bosh sahifaga qayting."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <button 
              onClick={this.handleReload}
              className="flex-1 flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-500 text-black font-bold py-3 px-6 rounded-xl transition-all"
            >
              <RefreshCcw size={18} />
              Yangilash
            </button>
            <button 
              onClick={this.handleGoHome}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all"
            >
              <Home size={18} />
              Bosh sahifa
            </button>
          </div>

          {import.meta.env?.DEV && this.state.error && (
            <div className="mt-12 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left max-w-2xl w-full overflow-auto">
              <p className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                {this.state.error.toString()}
              </p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
