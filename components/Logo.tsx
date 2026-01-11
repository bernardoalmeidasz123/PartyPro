
import React from 'react';

export const Logo: React.FC<{ className?: string; color?: string }> = ({ className = "w-12 h-12", color = "#d4af37" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 20H80V80H20V20Z" stroke={color} strokeWidth="2" />
    <path d="M35 35H65V50H35V35Z" fill={color} />
    <path d="M35 50V75" stroke={color} strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="1" strokeDasharray="4 4" />
  </svg>
);

export default Logo;
