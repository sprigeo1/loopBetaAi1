
import React from 'react';

interface Props {
  className?: string;
  active?: boolean;
}

export const PracticeIcon: React.FC<Props> = ({ className = "w-6 h-6", active = false }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Comet Head - slightly oblong and bright */}
      <ellipse cx="19" cy="5" rx="3.5" ry="3.5" fill="currentColor" className={active ? 'animate-pulse' : ''} />
      <circle cx="19" cy="5" r="1.5" fill="#fff" opacity="0.8" />
      
      {/* Trailing Tail - Multiple energetic streaks to avoid "handle" look */}
      <path 
        d="M16 8L3 21" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        opacity={active ? "1" : "0.5"} 
        className={active ? 'animate-[pulse_1s_infinite]' : ''}
      />
      
      {/* Secondary trails */}
      <path 
        d="M17.5 9.5L7 20" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        opacity="0.4"
        className={active ? 'animate-[pulse_1.2s_infinite_100ms]' : ''}
      />
      <path 
        d="M15.5 6.5L10 12" 
        stroke="currentColor" 
        strokeWidth="1" 
        strokeLinecap="round" 
        opacity="0.3"
        className={active ? 'animate-[pulse_1.5s_infinite_200ms]' : ''}
      />
      
      {/* Sparkles around head */}
      <circle cx="21.5" cy="8.5" r="0.8" fill="currentColor" opacity="0.6" />
      <circle cx="22" cy="2.5" r="0.6" fill="currentColor" opacity="0.6" />
      <circle cx="15.5" cy="3.5" r="0.7" fill="currentColor" opacity="0.6" />
      
      {/* Dust particles along the path */}
      <circle cx="12" cy="12" r="0.5" fill="currentColor" opacity="0.4" />
      <circle cx="8" cy="16" r="0.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
};
