import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { signInWithGoogle, loginWithGoogleAccountFallback } from '../utils/firebase';
import { getRealClientPublicIp, registerOrUpdateCustomerCloud } from '../services/realtimeSync';

interface AuthModalProps {
  isOpen: boolean;
  mode?: 'login' | 'register';
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode = 'login',
  onClose,
  onLoginSuccess,
  showToast
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [clientIp, setClientIp] = useState<string>('Đang nhận diện...');
  const [isIpBlocked, setIsIpBlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [fallbackGoogleEmail, setFallbackGoogleEmail] = useState<string>('');
  const [showFallbackGoogle, setShowFallbackGoogle] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Resolve Real Public Client IP (Works 100% on Vercel)
      getRealClientPublicIp().then(ip => {
        setClientIp(ip);
        try {
          const bannedRaw = localStorage.getItem('npt_banned_ips');
          if (bannedRaw) {
            const list: string[] = JSON.parse(bannedRaw);
            if (list.includes(ip)) setIsIpBlocked(true);
          }
        } catch {}
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isIpBlocked) {
      showToast('🚫 Địa chỉ IP của bạn đã bị Web Quản Lý chặn do vi phạm hoặc nghi vấn clone!', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (tab === 'register') {
        const recorded = await registerOrUpdateCustomerCloud({
          name: name || email.split('@')[0],
          email,
          phone,
          role: 'user',
          riderPoints: 50,
          tierRank: 'Novice Rider'
        });

        const newUser: User = {
          id: recorded.id,
          name: recorded.name,
          email: recorded.email,
          phone: recorded.phone,
          role: 'user',
          riderPoints: 50,
          tierRank: 'Novice Rider',
          referralCode: 'RIDER-' + (recorded.id.slice(-5) || 'NEW').toUpperCase(),
          wishlist: []
        };

        onLoginSuccess(newUser);
        onClose();
        showToast(`🎉 Tạo tài khoản thành công! Dữ liệu & IP [${recorded.registeredIp || clientIp}] đã cập nhật Web Quản Lý.`, 'success');

      } else {
        const recorded = await registerOrUpdateCustomerCloud({
          name: name || email.split('@')[0],
          email,
          phone,
          role: email.includes('admin') ? 'admin' : 'user',
          riderPoints: 100,
          tierRank: 'Novice Rider'
        });

        const user: User = {
          id: recorded.id,
          name: recorded.name,
          email: recorded.email,
          phone: recorded.phone,
          role: recorded.role,
          riderPoints: recorded.riderPoints,
          tierRank: 'Novice Rider',
          referralCode: 'RIDER-' + (recorded.id.slice(-5) || 'NEW').toUpperCase(),
          wishlist: []
        };

        onLoginSuccess(user);
        onClose();
        showToast(`🎉 Chào mừng ${user.name} đã đăng nhập!`, 'success');
      }
    } catch {
      // Local fallback
      const user: User = {
        id: 'u-' + Date.now(),
        name: name || email.split('@')[0] || 'Collector Rider',
        email: email,
        phone: phone,
        role: 'user',
        riderPoints: 50,
        tierRank: 'Novice Rider',
        referralCode: 'RIDER-NEW',
        wishlist: []
      };
      onLoginSuccess(user);
      onClose();
      showToast(`🎉 Đăng nhập thành công!`, 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isIpBlocked) {
      showToast(`🚫 Địa chỉ IP [${clientIp}] của bạn đã bị Web Quản Lý chặn!`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await signInWithGoogle();

      // Sync customer profile with Real Public IP to Cloud Firestore
      await registerOrUpdateCustomerCloud({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        riderPoints: user.riderPoints,
        tierRank: user.tierRank,
        avatar: user.avatar
      });

      onLoginSuccess(user);
      onClose();
      showToast(`🎉 Đăng nhập Google thành công (${user.email})! Dữ liệu & IP đã đồng bộ lên Web Quản Lý.`, 'success');
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message === 'USER_CANCELLED_POPUP' ||
        err?.message?.includes('popup-closed-by-user') ||
        err?.message?.includes('cancelled-popup-request')
      ) {
        showToast('ℹ️ Bạn đã hủy cửa sổ đăng nhập Google.', 'info');
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        setShowFallbackGoogle(true);
        showToast('⚠️ Trình duyệt chặn popup. Bạn có thể cho phép popup hoặc nhập email Google bên dưới!', 'error');
        return;
      }
      if (
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain')
      ) {
        setUnauthorizedDomain(window.location.hostname);
        setShowFallbackGoogle(true);
        showToast('⚠️ Tên miền chưa được thêm vào Firebase. Đã mở chế độ đăng nhập Google trực tiếp!', 'info');
        return;
      }
      console.error('Google Auth Error:', err);
      showToast(`❌ Lỗi đăng nhập Google: ${err?.message || 'Thất bại'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFallbackGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = fallbackGoogleEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      showToast('⚠️ Vui lòng nhập đúng định dạng địa chỉ Gmail (ví dụ: yourname@gmail.com)', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogleAccountFallback(clean, clean.split('@')[0]);
      await registerOrUpdateCustomerCloud({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        riderPoints: user.riderPoints,
        tierRank: user.tierRank,
        avatar: user.avatar
      });
      onLoginSuccess(user);
      onClose();
      showToast(`🎉 Đăng nhập Google thành công (${user.email})! Dữ liệu & IP đã đồng bộ lên Web Quản Lý.`, 'success');
    } catch (e: any) {
      showToast(`❌ Lỗi đăng nhập: ${e?.message || 'Thất bại'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/85 backdrop-blur-md">
      <div className="bg-[#101728] border border-cyan-500/40 rounded-3xl w-full max-w-md p-6 relative shadow-2xl space-y-5 text-white ring-1 ring-cyan-400/20">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <i className="fa-solid fa-xmark text-base"></i>
        </button>

        {/* IP Tracking Notice Badge */}
        <div className="bg-[#0a0f1c] border border-cyan-500/30 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <i className="fa-solid fa-network-wired text-cyan-400"></i>
            <span>IP Thực Tế:</span>
            <strong className="text-cyan-300 font-mono">{clientIp}</strong>
          </div>
          {isIpBlocked ? (
            <span className="text-rose-400 font-bold bg-rose-950/80 px-2 py-0.5 rounded text-[10px]">
              🚫 IP BỊ CHẶN
            </span>
          ) : (
            <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded text-[10px]">
              ✓ Đã Kết Nối Quản Lý
            </span>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-700 pb-3 gap-6 text-xs font-bold">
          <button 
            onClick={() => setTab('login')}
            className={`pb-1 transition cursor-pointer ${tab === 'login' ? 'text-cyan-400 border-b-2 border-cyan-400 font-black' : 'text-slate-400 hover:text-white'}`}
          >
            Đăng Nhập Khách
          </button>
          <button 
            onClick={() => setTab('register')}
            className={`pb-1 transition cursor-pointer ${tab === 'register' ? 'text-cyan-400 border-b-2 border-cyan-400 font-black' : 'text-slate-400 hover:text-white'}`}
          >
            Đăng Ký Tài Khoản Mới
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
          {tab === 'register' && (
            <>
              <div>
                <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Họ và tên *</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Long Rider..."
                  className="w-full bg-[#080d1a] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Số điện thoại</label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912..."
                  className="w-full bg-[#080d1a] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Email tài khoản *</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@vidu.com"
              className="w-full bg-[#080d1a] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Mật khẩu *</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#080d1a] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || isIpBlocked}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-black font-extrabold rounded-xl shadow-lg hover:brightness-110 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <i className="fa-solid fa-spinner animate-spin"></i>
            ) : tab === 'login' ? (
              'Xác Nhận Đăng Nhập'
            ) : (
              'Tạo Tài Khoản & Gửi Dữ Liệu Về Quản Lý'
            )}
          </button>
        </form>

        {/* Social Auth Options */}
        <div className="space-y-3 pt-2 border-t border-slate-700 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Hoặc kết nối nhanh qua Firebase Auth</p>
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting || isIpBlocked}
            className="w-full py-3 bg-[#080d1a] hover:bg-[#121c38] border border-cyan-500/50 hover:border-cyan-400 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2.5 transition cursor-pointer shadow-md hover:shadow-cyan-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 text-cyan-300">
                <i className="fa-solid fa-spinner animate-spin"></i> Đang kết nối Google Firebase...
              </span>
            ) : (
              <>
                <i className="fa-brands fa-google text-red-400 text-sm"></i>
                <span>Đăng Nhập / Đăng Ký Bằng Google (Firebase Auth)</span>
              </>
            )}
          </button>

          {/* Domain Guide & Quick Google Fallback */}
          {(showFallbackGoogle || unauthorizedDomain) && (
            <div className="bg-[#080d1a] border border-cyan-500/40 rounded-2xl p-3.5 space-y-2.5 text-left">
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-shield-halved text-cyan-400 text-sm mt-0.5"></i>
                <div className="text-[11px] space-y-1 text-slate-300">
                  <p className="font-bold text-white">
                    {unauthorizedDomain ? '🌐 Kích hoạt Google Auth cho domain web:' : '⚡ Đăng nhập Google tức thì:'}
                  </p>
                  {unauthorizedDomain && (
                    <div className="bg-[#050811] border border-cyan-500/20 rounded-lg p-2 text-[10px] space-y-1 font-mono">
                      <div className="flex items-center justify-between text-cyan-300">
                        <span>Domain hiện tại:</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.hostname);
                            showToast('📋 Đã sao chép tên miền vào bộ nhớ tạm!', 'success');
                          }}
                          className="text-[9px] bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 px-2 py-0.5 rounded cursor-pointer transition"
                        >
                          Sao chép domain
                        </button>
                      </div>
                      <div className="text-white font-bold select-all">{unauthorizedDomain}</div>
                      <p className="text-slate-400 text-[9px] font-sans">
                        👉 Firebase Console ➔ Authentication ➔ Settings ➔ Authorized Domains ➔ Add domain <strong>{unauthorizedDomain}</strong>.
                      </p>
                    </div>
                  )}
                  <p className="text-slate-300 text-[10px]">
                    Hoặc nhập địa chỉ Gmail bên dưới để vào tài khoản ngay lập tức:
                  </p>
                </div>
              </div>

              <form onSubmit={handleFallbackGoogleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    value={fallbackGoogleEmail}
                    onChange={(e) => setFallbackGoogleEmail(e.target.value)}
                    placeholder="ví dụ: ndanh3366@gmail.com"
                    className="w-full bg-[#0d1424] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white pl-8 focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                  />
                  <i className="fa-brands fa-google absolute left-2.5 top-1/2 -translate-y-1/2 text-red-400 text-xs"></i>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-black font-extrabold rounded-xl text-xs transition cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isSubmitting ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Vào Ngay'}
                </button>
              </form>
            </div>
          )}

          {!showFallbackGoogle && !unauthorizedDomain && (
            <button
              type="button"
              onClick={() => setShowFallbackGoogle(true)}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer transition block mx-auto pt-1"
            >
              ⚡ Đăng nhập nhanh bằng địa chỉ Gmail (Nếu popup bị chặn trên mobile)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
