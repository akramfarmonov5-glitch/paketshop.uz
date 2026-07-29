'use client';

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

  public componentDidMount() {
    sessionStorage.removeItem('paketshop_chunk_recovered');
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
    window.location.href = '/uz';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-950">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
             <AlertTriangle className="text-red-600" size={48} />
          </div>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            Texnik xatolik yuz berdi
          </h1>
          <p className="mx-auto mb-8 max-w-md leading-relaxed text-slate-600">
            {this.state.isRecovering
              ? 'Yangi versiya yuklanmoqda. Sahifa bir necha soniyada avtomatik yangilanadi.'
              : "Kechirasiz, tizimda kutilmagan nosozlik kuzatildi. Iltimos, sahifani yangilang yoki bosh sahifaga qayting."}
          </p>
          
          <div className="flex w-full max-w-sm flex-col gap-4 sm:flex-row">
            <button 
              onClick={this.handleReload}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
            >
              <RefreshCcw size={18} />
              Yangilash
            </button>
            <button 
              onClick={this.handleGoHome}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-800 transition hover:border-red-400 hover:text-red-700"
            >
              <Home size={18} />
              Bosh sahifa
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-12 w-full max-w-2xl overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-left">
              <p className="whitespace-pre-wrap font-mono text-sm text-red-700">
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
