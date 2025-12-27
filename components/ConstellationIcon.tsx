
import React from 'react';

interface Props {
  className?: string;
  active?: boolean;
}

export const ConstellationIcon: React.FC<Props> = ({ className = "w-6 h-6", active = false }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <circle cx="12" cy="4" r="1.5" fill="currentColor" className={active ? 'animate-pulse' : ''} />
      <circle cx="4" cy="10" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="20" cy="8" r="1.2" fill="currentColor" opacity="0.8" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
      <circle cx="6" cy="18" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="12" cy="21" r="0.8" fill="currentColor" opacity="0.4" />
      
      <path d="M12 4L4 10" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
      <path d="M12 4L20 8" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
      <path d="M4 10L6 18" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
      <path d="M20 8L16 16" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
      <path d="M16 16L12 21" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
      <path d="M6 18L12 21" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
    </svg>
  );
};
