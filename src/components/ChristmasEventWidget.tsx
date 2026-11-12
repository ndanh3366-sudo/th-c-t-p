import React, { useState, useEffect, useRef } from 'react';
import { christmasAudio } from '../utils/christmasAudio';
import { NeonSnowflakeIcon } from './NeonAquaChristmasIcons';

interface ChristmasEventWidgetProps {
  snowEnabled: boolean;
  onToggleSnow: () => void;
  onOpenVoucherModal?: () => void;
}

const YOUTUBE_VIDEO_ID = '7QKbsyQQY7k';
const START_TIME_SECONDS = 0;
const DEFAULT_VOLUME = 18;

export const ChristmasEventWidget: React.FC<ChristmasEventWidgetProps> = ({
  snowEnabled,
  onToggleSnow
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const hasSeekedRef = useRef(false);
  const hasInteractedRef = useRef(false);

  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);

  const sendYtCommand = (func: string, args: (string | number | boolean)[] = []) => {
    if (ytIframeRef.current && ytIframeRef.current.contentWindow) {
      ytIframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func,
          args
        }),
        '*'
      );
    }
  };

  const triggerAutoPlay = () => {
    sendYtCommand('setVolume', [DEFAULT_VOLUME]);
    sendYtCommand('seekTo', [START_TIME_SECONDS, true]);
    sendYtCommand('playVideo');
    setIsPlayingMusic(true);
  };

  useEffect(() => {
    const handleYtMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.event === 'onReady') {
            sendYtCommand('setVolume', [DEFAULT_VOLUME]);
            sendYtCommand('playVideo');
            setIsPlayingMusic(true);
          } else if (data.event === 'onStateChange') {
            if (data.info === 1) {
              setIsPlayingMusic(true);
            } else if (data.info === 2) {
              setIsPlayingMusic(false);
            } else if (data.info === 0) {
              sendYtCommand('seekTo', [START_TIME_SECONDS, true]);
              sendYtCommand('playVideo');
              setIsPlayingMusic(true);
            }
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleYtMessage);
    return () => {
      window.removeEventListener('message', handleYtMessage);
    };
  }, []);

  useEffect(() => {
    const handleFirstUserGesture = () => {
      if (hasInteractedRef.current) return;
      hasInteractedRef.current = true;
      triggerAutoPlay();
      ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
        window.removeEventListener(evt, handleFirstUserGesture);
      });
    };

    ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
      window.addEventListener(evt, handleFirstUserGesture, { passive: true });
    });

    return () => {
      ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
        window.removeEventListener(evt, handleFirstUserGesture);
      });
    };
  }, []);

  const handleToggleMusic = () => {
    christmasAudio.playChimeSfx();
    if (isPlayingMusic) {
      sendYtCommand('pauseVideo');
      setIsPlayingMusic(false);
    } else {
      if (!hasSeekedRef.current) {
        sendYtCommand('seekTo', [START_TIME_SECONDS, true]);
        hasSeekedRef.current = true;
      }
      sendYtCommand('setVolume', [volume]);
      sendYtCommand('playVideo');
      setIsPlayingMusic(true);
    }
  };

  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('npt_widget_pos');
      return saved ? JSON.parse(saved) : { x: window.innerWidth - 300, y: 80 };
    } catch {
      return { x: window.innerWidth - 300, y: 80 };
    }
  });

  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 240, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 70, e.clientY - dragOffsetRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        try {
          localStorage.setItem('npt_widget_pos', JSON.stringify(position));
        } catch {}
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [position]);

  return (
    <>
      <div className="fixed -bottom-96 -left-96 w-1 h-1 opacity-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <iframe
          ref={ytIframeRef}
          id="noel-youtube-audio"
          title="Nhạc Giáng Sinh Noel 2026"
          src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?start=0&enablejsapi=1&autoplay=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&playsinline=1`}
          allow="autoplay; encrypted-media"
          className="w-1 h-1"
          onLoad={() => {
            sendYtCommand('listening');
            sendYtCommand('setVolume', [DEFAULT_VOLUME]);
            sendYtCommand('playVideo');
          }}
        />
      </div>

      <div 
        className="fixed z-40 flex items-center gap-2 select-none pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center bg-[#0A0F1D]/95 border border-[#00F2FE]/60 rounded-full p-1 shadow-2xl backdrop-blur-md gap-2">
          <span className="text-cyan-400 px-1 opacity-70 hover:opacity-100" title="Giữ và kéo để di chuyển">
            <i className="fa-solid fa-grip-vertical text-xs"></i>
          </span>

          <button
            onClick={handleToggleMusic}
            className={`h-7 px-2.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              isPlayingMusic
                ? 'bg-[#00F2FE] text-slate-950 shadow-[0_0_12px_rgba(0,242,254,0.6)]'
                : 'bg-[#121214] text-slate-400 hover:text-white'
            }`}
            title={isPlayingMusic ? 'Nhấn để bật/tắt nhạc Noel' : 'Bật nhạc Noel'}
          >
            {isPlayingMusic ? (
              <>
                <span className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-slate-950 animate-pulse" />
                  <span className="w-0.5 h-3.5 bg-slate-950 animate-bounce" />
                  <span className="w-0.5 h-2 bg-slate-950 animate-pulse" />
                </span>
                <span className="text-[10px] font-mono font-black">{volume}%</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-volume-xmark text-xs"></i>
                <span className="text-[10px]">Tắt</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5 pr-2">
            <i className="fa-solid fa-volume-low text-[10px] text-[#00F2FE]"></i>
            <input 
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => {
                const newVol = Number(e.target.value);
                setVolume(newVol);
                sendYtCommand('setVolume', [newVol]);
                if (newVol > 0 && !isPlayingMusic) {
                  sendYtCommand('playVideo');
                  setIsPlayingMusic(true);
                }
              }}
              className="w-16 sm:w-20 accent-[#00F2FE] h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              title={`Âm lượng: ${volume}%`}
            />
          </div>
        </div>

        <button
          onClick={onToggleSnow}
          className={`w-8 h-8 rounded-full border backdrop-blur-md flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
            snowEnabled
              ? 'bg-[#0A0F1D]/85 border-[#00F2FE]/50 text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.3)]'
              : 'bg-[#121214]/85 border-slate-700 text-slate-500 hover:text-slate-300'
          }`}
          title={snowEnabled ? 'Tắt hiệu ứng tuyết rơi' : 'Bật hiệu ứng tuyết rơi'}
        >
          <NeonSnowflakeIcon size={14} glow={snowEnabled} />
        </button>
      </div>
    </>
  );
};
