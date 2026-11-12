import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Image as ImageIcon, Maximize2, Minimize2, GripVertical, Move, Sparkles, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  image?: string;
  timestamp: string;
}

interface CollectorSupportWidgetProps {
  onOpenProduct?: (productId: string) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const CollectorSupportWidget: React.FC<CollectorSupportWidgetProps> = ({
  showToast
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom Draggable positions
  const [buttonPos, setButtonPos] = useState<{ x: number; y: number } | null>(null);
  const [modalPos, setModalPos] = useState<{ x: number; y: number } | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Xin chào Tokufan! 🤖 Tôi là Trợ Lý AI Kamen Rider GPT (AI Vision) của NPTTEAMSTORE. Bạn cần tư vấn về đai Henshin Belt DX/CSM, mô hình SHF hay hỗ trợ thẩm định hình ảnh sản phẩm?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Button Drag Logic with requestAnimationFrame for 0-delay ultra-smooth movement
  const handleButtonMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const btnEl = buttonRef.current;
    if (!btnEl) return;

    const rect = btnEl.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    let moved = false;
    let rafId: number | null = null;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const curX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const curY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      if (Math.hypot(curX - clientX, curY - clientY) > 4) {
        moved = true;
      }

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const newX = Math.max(10, Math.min(window.innerWidth - rect.width - 10, curX - offsetX));
        const newY = Math.max(10, Math.min(window.innerHeight - rect.height - 10, curY - offsetY));
        setButtonPos({ x: newX, y: newY });
      });
    };

    const onUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);

      if (!moved) {
        setIsOpen(true);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  };

  // Modal Header Drag Logic with requestAnimationFrame for 0-delay ultra-smooth movement
  const handleModalHeaderMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const modalEl = modalRef.current;
    if (!modalEl) return;

    const rect = modalEl.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    let rafId: number | null = null;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const curX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const curY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const newX = Math.max(10, Math.min(window.innerWidth - rect.width - 10, curX - offsetX));
        const newY = Math.max(10, Math.min(window.innerHeight - rect.height - 10, curY - offsetY));
        setModalPos({ x: newX, y: newY });
      });
    };

    const onUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      if (showToast) showToast('Dung lượng ảnh tối đa 5MB!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && !selectedImage) || isLoading) return;

    const userText = inputMessage.trim();
    const currentImg = selectedImage;

    const newMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      text: userText,
      image: currentImg || undefined,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-4).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await api.chatWithAi(userText, historyPayload, currentImg ? { data: currentImg } : undefined);
      
      const assistantMsg: Message = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        text: res.reply || 'Cảm ơn câu hỏi của bạn. Hãy gửi thêm chi tiết nhé!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        text: '⚠️ Không thể kết nối máy chủ AI. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    '⚡ Tư vấn đai Henshin Belt DX & CSM phù hợp',
    '🔍 Phân biệt đai DX và CSM Bandai Japan',
    '🛡️ Chính sách bảo hành & hỗ trợ sửa đai',
    '📸 Thẩm định hình ảnh mô hình Tokusatsu'
  ];

  return (
    <>
      {/* Sleek Cyberpunk Floating AI Button */}
      {!isOpen && (
        <button
          ref={buttonRef}
          onMouseDown={handleButtonMouseDown}
          onTouchStart={handleButtonMouseDown}
          style={
            buttonPos
              ? { left: `${buttonPos.x}px`, top: `${buttonPos.y}px`, bottom: 'auto', right: 'auto' }
              : undefined
          }
          className={`fixed ${
            !buttonPos ? 'bottom-6 right-6' : ''
          } z-40 group flex items-center gap-3 p-1.5 pr-4 bg-slate-950/80 backdrop-blur-xl hover:bg-slate-900 text-white rounded-full border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:border-cyan-300 transition-all duration-300 cursor-grab active:cursor-grabbing select-none touch-none scale-100 hover:scale-105 active:scale-95`}
          title="Bấm để mở hoặc Kéo rê để di chuyển Trợ Lý AI"
        >
          {/* GripHandle Indicator */}
          <div className="pl-1.5 text-cyan-400 opacity-50 group-hover:opacity-90 transition-opacity">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Holographic Glowing Sphere Icon */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 shadow-inner shadow-cyan-200/50">
            <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-25"></div>
            <Bot className="w-5 h-5 text-slate-950 font-bold" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300 border border-slate-950"></span>
            </span>
          </div>

          {/* Button Text & Label */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-wider bg-gradient-to-r from-cyan-300 via-teal-200 to-white bg-clip-text text-transparent">
                TRỢ LÝ AI
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 rounded border border-cyan-400/40">
                Siêu Tốc
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium group-hover:text-cyan-200 transition-colors">
              Phản hồi tức thì 24/7
            </span>
          </div>
        </button>
      )}

      {/* Futuristic Floating Chat Glass Modal */}
      {isOpen && (
        <div 
          ref={modalRef}
          style={
            modalPos && !isExpanded
              ? { left: `${modalPos.x}px`, top: `${modalPos.y}px`, bottom: 'auto', right: 'auto' }
              : undefined
          }
          className={`fixed z-50 ${modalPos && !isExpanded ? '' : 'transition-all duration-300'} ${
            isExpanded 
              ? 'inset-3 sm:inset-8 max-w-5xl max-h-[92vh] mx-auto my-auto' 
              : !modalPos ? 'bottom-4 right-4 w-[95vw] sm:w-[430px] h-[600px] max-h-[88vh]' : 'w-[95vw] sm:w-[430px] h-[600px] max-h-[88vh]'
          } bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/35 rounded-3xl shadow-[0_0_50px_rgba(8,145,178,0.3)] flex flex-col overflow-hidden ring-1 ring-white/10`}
        >
          {/* Header - Draggable Area */}
          <div 
            onMouseDown={handleModalHeaderMouseDown}
            onTouchStart={handleModalHeaderMouseDown}
            className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-950 via-cyan-950/70 to-slate-950 border-b border-cyan-500/25 cursor-move select-none touch-none"
            title="Kéo thanh tiêu đề để di chuyển cửa sổ chat AI"
          >
            {/* Background Cyber Glow Accent */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>

            <div className="flex items-center gap-3">
              <div className="p-1 text-cyan-400 opacity-60 hover:opacity-100 transition-opacity">
                <Move className="w-4 h-4" />
              </div>
              <div className="relative p-2 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/40 text-cyan-300 shadow-inner">
                <Bot className="w-5 h-5 animate-pulse" />
                <Zap className="w-3 h-3 text-emerald-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white tracking-wide flex items-center gap-1.5">
                    Rider GPT Turbo
                  </h3>
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-400/40 uppercase flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-emerald-400" /> Fast
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
                  <span className="text-slate-300 font-medium">Phản hồi siêu tốc & nhận diện ảnh</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer border border-transparent hover:border-cyan-500/30"
                title={isExpanded ? "Thu nhỏ" : "Phóng to"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/30"
                title="Đóng chat AI"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 backdrop-blur-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white rounded-br-xs shadow-lg shadow-cyan-600/20 border border-cyan-400/30'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-bl-xs shadow-md shadow-slate-950/80'
                }`}>
                  {msg.image && (
                    <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 max-w-[220px] shadow-md">
                      <img src={msg.image} alt="Uploaded attachment" className="w-full h-auto object-cover" />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">{msg.text}</p>
                  <span className={`text-[10px] mt-2 block text-right font-mono ${
                    msg.role === 'user' ? 'text-cyan-100/70' : 'text-slate-500'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                    BẠN
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-2xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-900/90 border border-cyan-500/30 p-3.5 rounded-2xl rounded-bl-xs text-slate-300 flex items-center gap-2.5 shadow-md">
                  <Cpu className="w-4 h-4 animate-pulse text-cyan-400" />
                  <span className="text-xs text-cyan-200 animate-pulse font-medium">Trợ Lý AI đang suy nghĩ & phân tích...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputMessage(prompt);
                }}
                className="shrink-0 text-[11px] px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all duration-200 shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="px-4 py-2 bg-slate-900/90 border-t border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={selectedImage} alt="Preview" className="w-10 h-10 object-cover rounded-xl border border-cyan-400/50 shadow-md" />
                <span className="text-xs text-cyan-300 font-medium">Đã tải lên 1 ảnh đai / mô hình để thẩm định AI</span>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedImage(null)}
                className="text-slate-400 hover:text-red-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
              title="Tải ảnh đai / mô hình để AI Vision thẩm định"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập câu hỏi hoặc tải ảnh để AI thẩm định..."
              className="flex-1 bg-slate-900/90 border border-slate-800 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-500 transition-all"
            />

            <button
              type="submit"
              disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 shadow-lg shadow-cyan-500/25 transition-all font-bold"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};


