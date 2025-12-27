import React from 'react';

interface Props {
  className?: string;
  variant?: 'infinity' | 'oo';
}

export const InfinityLogo: React.FC<Props> = ({ className = "w-32 h-16", variant = 'infinity' }) => {
  const isLogo = variant === 'oo';

  // Helper for slow drawing animation styles
  const drawStyle = (isActive: boolean, delay: string) => ({
    strokeDasharray: 300, 
    strokeDashoffset: isActive ? 0 : 300,
    transition: `stroke-dashoffset 2.5s ease-in-out ${delay}, opacity 2.5s ease-in-out ${delay}`,
    opacity: isActive ? 1 : 0
  });

  return (
    <svg viewBox="0 0 180 90" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="loopGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fb923c" /> {/* Orange-400 */}
          <stop offset="50%" stopColor="#f97316" /> {/* Orange-500 */}
          <stop offset="100%" stopColor="#ea580c" /> {/* Orange-600 */}
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.0" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* 
        Infinity Path - The Source
        Centers aligned with O1 (70,45) and O2 (110,45)
      */}
      <path 
        d="M90,45 
           C90,45 85,25 70,25 
           C55,25 50,45 50,45
           C50,45 55,65 70,65 
           C85,65 90,45 90,45 
           C90,45 95,25 110,25 
           C125,25 130,45 130,45
           C130,45 125,65 110,65 
           C95,65 90,45 90,45" 
        fill="none" 
        stroke="url(#loopGradient)" 
        strokeWidth="8" 
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        className="transition-all duration-[2000ms] ease-in-out"
        style={{
          opacity: isLogo ? 0 : 1,
          transitionDelay: isLogo ? '1500ms' : '0ms' // Stays visible while L forms
        }}
      >
        {!isLogo && (
          <animate 
            attributeName="stroke-dasharray" 
            from="0, 500" 
            to="500, 0" 
            dur="3s" 
            fill="freeze" 
          />
        )}
      </path>

      {/* "Loop" Letter Group */}
      <g>
        
        {/* L Shape - Phase 1 (0ms delay) */}
        {/* Vertical line at x=30, curving right to point to O1 */}
        <path 
          d="M 30 15 L 30 55 Q 30 70 45 70" 
          fill="none" 
          stroke="url(#loopGradient)" 
          strokeWidth="8" 
          strokeLinecap="round"
          filter="url(#glow)"
          style={drawStyle(isLogo, '0ms')}
        />

        {/* O1 - Phase 2 (1500ms delay) */}
        <circle 
          cx="70" cy="45" r="18" 
          fill="none" 
          stroke="url(#loopGradient)" 
          strokeWidth="8" 
          filter="url(#glow)" 
          className="transition-opacity duration-[2000ms] ease-in-out"
          style={{
            opacity: isLogo ? 1 : 0,
            transitionDelay: '1500ms' 
          }}
        />

        {/* O2 - Phase 2 (1500ms delay) */}
        <circle 
          cx="110" cy="45" r="18" 
          fill="none" 
          stroke="url(#loopGradient)" 
          strokeWidth="8" 
          filter="url(#glow)" 
          className="transition-opacity duration-[2000ms] ease-in-out"
          style={{
            opacity: isLogo ? 1 : 0,
            transitionDelay: '1500ms'
          }}
        />

        {/* P Shape - Phase 3 (3000ms delay) */}
        <g style={{ transition: 'opacity 2.5s ease-in-out 3000ms', opacity: isLogo ? 1 : 0 }}>
          {/* P Bowl - Just another circle */}
          <circle 
             cx="150" cy="45" r="18" 
             fill="none" 
             stroke="url(#loopGradient)" 
             strokeWidth="8" 
             filter="url(#glow)" 
             className="transition-opacity duration-[2500ms]"
             style={{ transitionDelay: '3000ms' }}
          />
          {/* P Vertical Stroke - Descending on the left side of the bowl (tangent at x=132) */}
          <path 
            d="M 132 45 L 132 90" 
            fill="none" 
            stroke="url(#loopGradient)" 
            strokeWidth="8" 
            strokeLinecap="round"
            filter="url(#glow)"
            className="transition-all duration-[2500ms] ease-in-out"
            style={{ 
               strokeDasharray: 100,
               strokeDashoffset: isLogo ? 0 : 100,
               transitionDelay: '3000ms'
            }}
          />
        </g>
      </g>
    </svg>
  );
};
