import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  wind: number;
  swing: number;
  swingSpeed: number;
  rotation: number;
  rotationSpeed: number;
  type: 0 | 1 | 2 | 3; // 0 = Glowing Aqua Circle, 1 = Neon Gold Star, 2 = Snow White Snowflake, 3 = Aqua Ice Crystal
}

interface ChristmasSnowEffectProps {
  enabled?: boolean;
}

// Generate high-resolution pre-rendered offscreen sprite canvases to maximize GPU performance & crisp large snowflakes
const createParticleSprites = (): HTMLCanvasElement[] => {
  const spriteSize = 96;
  const center = spriteSize / 2;
  const types: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3];

  return types.map((type) => {
    const offscreen = document.createElement('canvas');
    offscreen.width = spriteSize;
    offscreen.height = spriteSize;
    const c = offscreen.getContext('2d');
    if (!c) return offscreen;

    c.save();
    c.translate(center, center);

    if (type === 0) {
      // 0: Hạt tròn Aqua Neon phát sáng lớn lung linh (#00F2FE & #05FFD2)
      const grad = c.createRadialGradient(0, 0, 2, 0, 0, 22);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.25, '#00F2FE');
      grad.addColorStop(0.65, 'rgba(5, 255, 210, 0.6)');
      grad.addColorStop(1, 'rgba(0, 242, 254, 0)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(0, 0, 22, 0, Math.PI * 2);
      c.fill();

      // White inner core
      c.fillStyle = '#FFFFFF';
      c.beginPath();
      c.arc(0, 0, 5, 0, Math.PI * 2);
      c.fill();
    } else if (type === 1) {
      // 1: Ngôi sao Vàng Ánh Kim Neon lớn (#FFD700)
      c.shadowColor = 'rgba(255, 215, 0, 0.9)';
      c.shadowBlur = 10;
      c.fillStyle = '#FFD700';
      c.strokeStyle = '#FFFBEB';
      c.lineWidth = 1.6;

      c.beginPath();
      const points = 5;
      const outerR = 22;
      const innerR = 9;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.closePath();
      c.fill();
      c.stroke();
    } else if (type === 2) {
      // 2: Bông tuyết Trắng Tuyết pha lê kích thước lớn (#E0F7FA) 6 cánh phân nhánh chi tiết
      c.strokeStyle = '#E0F7FA';
      c.lineWidth = 2.4;
      c.lineCap = 'round';
      c.shadowColor = 'rgba(0, 242, 254, 0.85)';
      c.shadowBlur = 10;

      const baseRadius = 32;
      const angleStep = Math.PI / 3;

      for (let i = 0; i < 6; i++) {
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(0, baseRadius);
        c.stroke();

        // Branch 1
        const b1 = baseRadius * 0.45;
        const bl1 = baseRadius * 0.32;
        c.beginPath();
        c.moveTo(0, b1);
        c.lineTo(-bl1, b1 + bl1 * 0.65);
        c.moveTo(0, b1);
        c.lineTo(bl1, b1 + bl1 * 0.65);
        c.stroke();

        // Branch 2 (Outer tip branches)
        const b2 = baseRadius * 0.75;
        const bl2 = baseRadius * 0.22;
        c.beginPath();
        c.moveTo(0, b2);
        c.lineTo(-bl2, b2 + bl2 * 0.7);
        c.moveTo(0, b2);
        c.lineTo(bl2, b2 + bl2 * 0.7);
        c.stroke();

        // Tip diamond
        c.fillStyle = '#FFFFFF';
        c.beginPath();
        c.arc(0, baseRadius, 2.2, 0, Math.PI * 2);
        c.fill();

        c.rotate(angleStep);
      }
      c.fillStyle = '#FFFFFF';
      c.beginPath();
      c.arc(0, 0, 4.5, 0, Math.PI * 2);
      c.fill();
    } else {
      // 3: Tinh thể băng lục giác Aqua Neon to nổi bật (#05FFD2 & #00F2FE)
      c.strokeStyle = '#05FFD2';
      c.lineWidth = 2.6;
      c.lineCap = 'round';
      c.shadowColor = 'rgba(5, 255, 210, 0.95)';
      c.shadowBlur = 12;

      const baseRadius = 30;
      const angleStep = Math.PI / 3;
      for (let i = 0; i < 6; i++) {
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(0, baseRadius);
        c.stroke();

        const d1 = baseRadius * 0.55;
        const dw1 = baseRadius * 0.3;
        c.beginPath();
        c.moveTo(0, d1);
        c.lineTo(-dw1, d1 + dw1 * 0.5);
        c.moveTo(0, d1);
        c.lineTo(dw1, d1 + dw1 * 0.5);
        c.stroke();

        const d2 = baseRadius * 0.82;
        const dw2 = baseRadius * 0.18;
        c.beginPath();
        c.moveTo(0, d2);
        c.lineTo(-dw2, d2);
        c.moveTo(0, d2);
        c.lineTo(dw2, d2);
        c.stroke();

        c.rotate(angleStep);
      }
      c.fillStyle = '#00F2FE';
      c.beginPath();
      c.arc(0, 0, 4, 0, Math.PI * 2);
      c.fill();
    }

    c.restore();
    return offscreen;
  });
};

export const ChristmasSnowEffect: React.FC<ChristmasSnowEffectProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Pre-cache crystal sprites once
    const sprites = createParticleSprites();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Number of particles tuned for gentle, elegant, non-intrusive snowfall
    const particleCount = Math.min(55, Math.max(28, Math.floor((width * height) / 20000)));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      // 0: Aqua circle, 1: Gold star, 2: Snow white flake, 3: Aqua ice crystal
      const typeChoice = (i % 4) as 0 | 1 | 2 | 3;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        // Small, delicate, subtle snowflakes
        radius: typeChoice === 0 ? Math.random() * 2.5 + 2 : Math.random() * 3.5 + 3,
        speed: Math.random() * 0.6 + 0.35,
        opacity: Math.random() * 0.3 + 0.45,
        wind: (Math.random() - 0.5) * 0.2,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.015 + 0.005,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        type: typeChoice
      });
    }

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Gentle horizontal sway
        p.swing += p.swingSpeed;
        const swayX = Math.sin(p.swing) * 0.7;

        // Graceful rotation
        p.rotation += p.rotationSpeed;

        // Subtle mouse proximity drift
        const dx = mx - p.x;
        const dy = my - p.y;
        let pushX = 0;
        if (Math.abs(dx) < 120 && Math.abs(dy) < 120) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            pushX = (dx / dist) * -1.2;
          }
        }

        p.y += p.speed;
        p.x += swayX + p.wind + pushX;

        // Boundary wrap
        if (p.y > height + p.radius * 2) {
          p.y = -p.radius * 2;
          p.x = Math.random() * width;
        }
        if (p.x > width + p.radius * 2) {
          p.x = -p.radius * 2;
        } else if (p.x < -p.radius * 2) {
          p.x = width + p.radius * 2;
        }

        // Draw cached sprite with hardware acceleration
        const sprite = sprites[p.type];
        const diameter = p.radius * 2;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.drawImage(sprite, -p.radius, -p.radius, diameter, diameter);
        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameId.current) {
          cancelAnimationFrame(animFrameId.current);
          animFrameId.current = null;
        }
      } else {
        if (!animFrameId.current) {
          animFrameId.current = requestAnimationFrame(render);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 select-none will-change-transform"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
