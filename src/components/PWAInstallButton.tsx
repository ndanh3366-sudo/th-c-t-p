import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running as an installed standalone PWA, suppress the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow (beforeinstallprompt is available)
  if (isInstallable) {
    if (variant === 'header') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={installing}
          className={`group flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm shadow-cyan-500/20 hover:scale-105 cursor-pointer ${className}`}
          title="Cài đặt NPTTEAMSTORE làm ứng dụng máy tính/điện thoại (chạy mượt & offline)"
        >
          <i className="fa-solid fa-download text-[11px] group-hover:translate-y-0.5 transition-transform text-cyan-400"></i>
          <span>{installing ? 'Đang cài đặt...' : 'Cài App Web'}</span>
          <span className="bg-cyan-400/20 text-cyan-300 text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase">
            PWA
          </span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        disabled={installing}
        className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition cursor-pointer ${className}`}
      >
        <i className="fa-solid fa-cloud-arrow-down text-sm"></i>
        <span>{installing ? 'Đang xử lý...' : 'Cài Đặt Ứng Dụng (Chạy Offline)'}</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit doesn't fire beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101935] border border-cyan-500/40 hover:border-cyan-300 text-cyan-300 text-xs font-semibold hover:text-white transition cursor-pointer ${className}`}
          title="Hướng dẫn cài đặt lên màn hình chính iPhone / iPad"
        >
          <i className="fa-brands fa-apple text-xs"></i>
          <span>Cài trên iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-[#0e1628] border border-cyan-400/60 p-6 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <i className="fa-brands fa-apple text-cyan-400 text-xl"></i>
                  <h3 className="font-serif-title text-base font-bold text-white">Cài Đặt Trên iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 bg-[#152038] p-3 rounded-xl border border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    1
                  </span>
                  <p>
                    Nhấn vào nút <strong className="text-cyan-300">Chia sẻ</strong> (<i className="fa-solid fa-arrow-up-from-bracket text-cyan-400"></i>) ở thanh dưới cùng Safari.
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-[#152038] p-3 rounded-xl border border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    2
                  </span>
                  <p>
                    Cuộn xuống và chọn <strong className="text-cyan-300">"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-[#152038] p-3 rounded-xl border border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    3
                  </span>
                  <p>
                    Nhấn <strong className="text-cyan-300">"Thêm" (Add)</strong> ở góc trên bên phải để hoàn tất. Bạn có thể mở app ngay từ màn hình chính và dùng cả khi mất mạng!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop manual button (if browser hasn't fired prompt yet or allows manual trigger)
  return (
    <button
      onClick={() => {
        alert?.('Để cài đặt ứng dụng: Hãy nhấn biểu tượng Cài đặt trên thanh địa chỉ trình duyệt Chrome/Edge của bạn, hoặc chọn Menu > Thêm vào màn hình chính.');
      }}
      className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-medium transition cursor-pointer ${className}`}
      title="Cài app NPTTEAMSTORE để lướt mượt mà và hỗ trợ ngoại tuyến"
    >
      <i className="fa-solid fa-download text-[11px] text-cyan-400"></i>
      <span>App Trực Tuyến & Ngoại Tuyến</span>
    </button>
  );
};
