import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Error Boundary to prevent blank screens and show friendly Tokusatsu-themed recovery
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class RootErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NPTSTORE ErrorBoundary] Uncaught render exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070c1e] text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold font-['Cinzel'] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300 mb-2">
            NPTTEAMSTORE - HỆ THỐNG ĐANG KHÔI PHỤC
          </h1>
          <p className="text-zinc-400 text-sm max-w-md mb-6 leading-relaxed">
            Hệ thống Rider đã tự động bảo vệ dữ liệu. Vui lòng bấm làm mới để tải lại giao diện hoàn chỉnh.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              🔄 Tải lại trang (Reload)
            </button>
            <button
              onClick={() => {
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                } catch {}
                window.location.href = '/';
              }}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-semibold rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              🧹 Xóa bộ nhớ đệm
            </button>
          </div>
          {this.state.error && (
            <pre className="mt-8 p-4 bg-black/40 border border-white/5 rounded-lg text-left text-xs text-red-400/80 font-mono max-w-xl max-h-40 overflow-auto">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// Initialize PWA Service Worker safely
try {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('[NPTSTORE PWA] New update available');
    },
    onOfflineReady() {
      console.log('[NPTSTORE PWA] App is ready for offline usage');
    },
  });
} catch (e) {
  console.warn('[NPTSTORE PWA] Service worker init skipped:', e);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>,
  );
}

