export interface CustomAvatarOptions {
  maskId: string;
  colorId: string;
  initials: string;
  customerName?: string;
}

export interface AvatarMask {
  id: string;
  name: string;
  icon: string;
  symbolText: string;
  badge: string;
}

export interface AvatarColor {
  id: string;
  name: string;
  gradient: string;
  borderColor: string;
  textColor: string;
  glow: string;
}

export const PRESET_AVATAR_MASKS: AvatarMask[] = [
  { id: 'geats-fox', name: 'Geats Fox', icon: '🦊', symbolText: 'GEATS', badge: 'MAGNUM' },
  { id: 'saber-dragon', name: 'Saber Fire Dragon', icon: '🐉', symbolText: 'SABER', badge: 'BRAVE' },
  { id: 'gavv-gummy', name: 'Gavv Candy Hunter', icon: '🍭', symbolText: 'GAVV', badge: 'POPPIN' },
  { id: 'decade-king', name: 'Decade Destroyer', icon: '🦗', symbolText: 'DECADE', badge: 'PASSING' },
  { id: 'zero-one', name: 'Zero-One Hopper', icon: '⚡', symbolText: '01-AI', badge: 'RISING' },
  { id: 'kiva-bat', name: 'Kiva Vampire King', icon: '🦇', symbolText: 'KIVA', badge: 'FANG' },
  { id: 'faiz-red', name: 'Faiz Crimson Photon', icon: '📱', symbolText: 'FAIZ', badge: '555' },
  { id: 'king-collector', name: 'Tokusatsu Royal King', icon: '👑', symbolText: 'ROYAL', badge: 'VIP' }
];

export const PRESET_AVATAR_COLORS: AvatarColor[] = [
  { 
    id: 'crimson-ruby', 
    name: 'Đỏ Huyết Ruby (Hot)', 
    gradient: 'from-rose-600 via-red-600 to-amber-600', 
    borderColor: 'border-rose-400', 
    textColor: 'text-rose-300',
    glow: 'rgba(244,63,94,0.6)'
  },
  { 
    id: 'gold-bandai', 
    name: 'Vàng Hoàng Kim', 
    gradient: 'from-amber-400 via-yellow-500 to-amber-600', 
    borderColor: 'border-amber-400', 
    textColor: 'text-amber-300',
    glow: 'rgba(245,158,11,0.6)'
  },
  { 
    id: 'cyber-cyan', 
    name: 'Xanh Cyber Henshin', 
    gradient: 'from-cyan-400 via-blue-500 to-teal-500', 
    borderColor: 'border-cyan-400', 
    textColor: 'text-cyan-300',
    glow: 'rgba(6,182,212,0.6)'
  },
  { 
    id: 'dark-purple', 
    name: 'Tím Ma Lực Dark Rider', 
    gradient: 'from-purple-600 via-fuchsia-600 to-pink-600', 
    borderColor: 'border-purple-400', 
    textColor: 'text-purple-300',
    glow: 'rgba(168,85,247,0.6)'
  },
  { 
    id: 'silver-knight', 
    name: 'Bạc Hộ Vệ Paladin', 
    gradient: 'from-slate-200 via-zinc-400 to-slate-600', 
    borderColor: 'border-slate-300', 
    textColor: 'text-slate-200',
    glow: 'rgba(203,213,225,0.6)'
  }
];

export function getInitials(name: string): string {
  if (!name || !name.trim()) return 'RD';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generates an SVG Data URL representing the custom-created customer avatar.
 * This can be used as an <img> src anywhere, saved in localStorage, or sent to backend.
 */
export function generateCustomerAvatarSvgUrl({
  maskId,
  colorId,
  initials,
  customerName = 'Rider Collector'
}: CustomAvatarOptions): string {
  const mask = PRESET_AVATAR_MASKS.find(m => m.id === maskId) || PRESET_AVATAR_MASKS[0];
  const color = PRESET_AVATAR_COLORS.find(c => c.id === colorId) || PRESET_AVATAR_COLORS[0];
  const safeInitials = (initials || getInitials(customerName)).slice(0, 3).toUpperCase();

  let c1 = '#e11d48';
  let c2 = '#dc2626';
  let c3 = '#b91c1c';
  let strokeColor = '#f43f5e';

  if (color.id === 'gold-bandai') {
    c1 = '#f59e0b'; c2 = '#d97706'; c3 = '#b45309'; strokeColor = '#fbbf24';
  } else if (color.id === 'cyber-cyan') {
    c1 = '#06b6d4'; c2 = '#0284c7'; c3 = '#0369a1'; strokeColor = '#22d3ee';
  } else if (color.id === 'dark-purple') {
    c1 = '#9333ea'; c2 = '#7e22ce'; c3 = '#6b21a8'; strokeColor = '#c084fc';
  } else if (color.id === 'silver-knight') {
    c1 = '#94a3b8'; c2 = '#64748b'; c3 = '#475569'; strokeColor = '#e2e8f0';
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="60%" stop-color="${c2}" />
      <stop offset="100%" stop-color="${c3}" />
    </linearGradient>
    <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Outer Rounded Shield Frame -->
  <rect x="4" y="4" width="112" height="112" rx="28" fill="#08020a" stroke="${strokeColor}" stroke-width="3.5" />
  
  <!-- Gradient Body Inside -->
  <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#bgGrad)" />
  <circle cx="60" cy="50" r="42" fill="url(#auraGlow)" />

  <!-- Inner Tech Circuit Ring -->
  <circle cx="60" cy="52" r="32" fill="#07020a" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="4,3" opacity="0.85" />

  <!-- Central Mask Icon Emoji / Motif -->
  <text x="60" y="58" font-size="34" text-anchor="middle" dominant-baseline="middle" filter="url(#shadow)">${mask.icon}</text>

  <!-- Bottom Call-sign / Initials Badge -->
  <rect x="22" y="86" width="76" height="22" rx="11" fill="#08020a" stroke="${strokeColor}" stroke-width="1.8" />
  <text x="60" y="101" font-family="Montserrat, system-ui, sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">${safeInitials} • ${mask.badge}</text>

  <!-- Little Henshin Star Corner -->
  <polygon points="100,16 102,22 108,24 102,26 100,32 98,26 92,24 98,22" fill="#ffffff" opacity="0.9" />
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
