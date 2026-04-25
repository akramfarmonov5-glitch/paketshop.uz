import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

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
            Kechirasiz, tizimda kutilmagan nosozlik kuzatildi. Iltimos, sahifani yangilang yoki bosh sahifaga qayting.
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
