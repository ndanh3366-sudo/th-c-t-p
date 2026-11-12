import React from 'react';

interface NeonIconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const NeonTreeIcon: React.FC<NeonIconProps> = ({ 
  className = "text-[#00F2FE]", 
  size = 20, 
  glow = true 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block stroke-current ${glow ? 'drop-shadow-[0_0_8px_rgba(0,242,254,0.7)]' : ''} ${className}`}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Geometric Angular Line-Art Christmas Tree */}
    <path d="M12 2.5L9 6.5H11L7.5 11.5H10L6 17.5H18L14 11.5H16.5L13 6.5H15L12 2.5Z" />
    <path d="M11 17.5V21.5H13V17.5" />
    {/* Golden tip star dot */}
    <circle cx="12" cy="2.5" r="1.2" fill="#FFD700" stroke="#FFD700" strokeWidth="0.8" className="drop-shadow-[0_0_6px_rgba(255,215,0,0.9)]" />
    {/* Geometric horizontal bauble wire */}
    <line x1="9" y1="9" x2="15" y2="9" strokeOpacity="0.5" strokeDasharray="1 2" />
    <line x1="8" y1="14.5" x2="16" y2="14.5" strokeOpacity="0.5" strokeDasharray="1 2" />
  </svg>
);

export const NeonReindeerIcon: React.FC<NeonIconProps> = ({ 
  className = "text-[#05FFD2]", 
  size = 20, 
  glow = true 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block stroke-current ${glow ? 'drop-shadow-[0_0_8px_rgba(5,255,210,0.7)]' : ''} ${className}`}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Sleek Line-Art Reindeer profile */}
    <path d="M4 4L7 8L10 6" />
    <path d="M6 6L9 4" />
    <path d="M7 8L6.5 12L10 14L15 13L18 16V20" />
    <path d="M10 14L9 20" />
    <path d="M15 13L15.5 18" />
    <path d="M18 16L20 18V20" />
    <circle cx="5" cy="11" r="0.8" fill="#FFD700" stroke="#FFD700" />
  </svg>
);

export const NeonSnowflakeIcon: React.FC<NeonIconProps> = ({ 
  className = "text-[#00F2FE]", 
  size = 20, 
  glow = true 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block stroke-current ${glow ? 'drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]' : ''} ${className}`}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Hexagonal Dendritic Line-Art Snowflake */}
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="3.34" y1="7" x2="20.66" y2="17" />
    <line x1="3.34" y1="17" x2="20.66" y2="7" />
    {/* Top and Bottom Chevron Notches */}
    <path d="M9.5 4.5L12 7L14.5 4.5" />
    <path d="M9.5 19.5L12 17L14.5 19.5" />
    {/* Diagonal notches */}
    <path d="M5.5 9.5L7.5 12L6 14.5" />
    <path d="M18.5 9.5L16.5 12L18 14.5" />
    <circle cx="12" cy="12" r="1.5" stroke="#E0F7FA" strokeWidth="1.2" />
  </svg>
);

export const NeonStarIcon: React.FC<NeonIconProps> = ({ 
  className = "text-[#FFD700]", 
  size = 20, 
  glow = true 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block stroke-current ${glow ? 'drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]' : ''} ${className}`}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

export const NeonGiftIcon: React.FC<NeonIconProps> = ({ 
  className = "text-[#00F2FE]", 
  size = 20, 
  glow = true 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block stroke-current ${glow ? 'drop-shadow-[0_0_8px_rgba(0,242,254,0.7)]' : ''} ${className}`}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Angular Box */}
    <rect x="3" y="8" width="18" height="13" rx="1" />
    <line x1="12" y1="8" x2="12" y2="21" stroke="#FFD700" />
    <line x1="3" y1="14" x2="21" y2="14" stroke="#FFD700" />
    {/* Ribbons */}
    <path d="M7.5 8C6 6.5 6 4 8 4C10.5 4 12 8 12 8" stroke="#FFD700" />
    <path d="M16.5 8C18 6.5 18 4 16 4C13.5 4 12 8 12 8" stroke="#FFD700" />
  </svg>
);
