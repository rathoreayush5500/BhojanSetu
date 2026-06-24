import React from 'react';

interface BhojanSetuLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const BhojanSetuLogo: React.FC<BhojanSetuLogoProps> = ({
  className = "",
  size = 48,
  showText = false
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          {/* Main Gradient for the Outer Ring */}
          <linearGradient id="logoRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803d" /> {/* Green */}
            <stop offset="50%" stopColor="#22c55e" /> {/* Light Green */}
            <stop offset="100%" stopColor="#f97316" /> {/* Orange */}
          </linearGradient>

          {/* Golden Orange Food Gradient */}
          <linearGradient id="foodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Leaf Gradient */}
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* Sky/City Shadow Gradient */}
          <linearGradient id="cityGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#86efac" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* 1. OUTER SEMI-RING / CIRCULAR BOUNDARY */}
        <path
          d="M 95,250 A 155,155 0 1,1 405,250 A 155,155 0 0,1 95,250"
          fill="none"
          stroke="url(#logoRingGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="900"
          strokeDashoffset="10"
        />

        {/* 2. CITY SKYLINE SILHOUETTE (Under the bridge arch) */}
        <g id="skyline" opacity="0.8">
          <rect x="210" y="210" width="10" height="35" rx="1" fill="#86efac" />
          <rect x="222" y="195" width="14" height="50" rx="1" fill="#65a30d" opacity="0.3" />
          <rect x="238" y="180" width="16" height="65" rx="1" fill="#22c55e" opacity="0.45" />
          <rect x="256" y="190" width="12" height="55" rx="1" fill="#16a34a" opacity="0.35" />
          <rect x="270" y="205" width="10" height="40" rx="1" fill="#86efac" />
          <rect x="282" y="215" width="8" height="30" rx="1" fill="#22c55e" opacity="0.5" />
        </g>

        {/* 3. THE "B" THAT TRANSITIONS INTO THE BRIDGE */}
        {/* Leftmost side: B text/path */}
        <path
          d="M 125,120 
             C 165,120 185,135 185,155 
             C 185,170 170,180 155,185 
             C 175,190 195,205 195,230 
             C 195,255 170,270 120,270 
             L 100,270 L 100,120 Z
             M 122,142 L 122,180 L 138,180 C 148,180 156,174 156,161 C 156,148 148,142 138,142 Z
             M 122,200 L 122,248 L 140,248 C 152,248 162,240 162,224 C 162,208 152,200 140,200 Z"
          fill="#0c4a24"
        />

        {/* 4. THE BRIDGE ARCH & RAILING */}
        {/* The solid bridge arch path linking across */}
        <path
          d="M 160,260 
             Q 250,150 380,250 
             C 382,252 385,255 385,258
             L 385,268
             Q 250,185 160,275 Z"
          fill="#14532d"
        />

        {/* Bridge Railing arcs */}
        <path
          d="M 175,235 Q 250,140 370,225"
          fill="none"
          stroke="#14532d"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 175,220 Q 250,125 370,210"
          fill="none"
          stroke="#0f2914"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Vertical posts for the bridge */}
        <line x1="190" y1="218" x2="190" y2="248" stroke="#14532d" strokeWidth="4" />
        <line x1="220" y1="192" x2="220" y2="222" stroke="#14532d" strokeWidth="4" />
        <line x1="250" y1="178" x2="250" y2="208" stroke="#14532d" strokeWidth="4" />
        <line x1="280" y1="178" x2="280" y2="208" stroke="#14532d" strokeWidth="4" />
        <line x1="310" y1="188" x2="310" y2="218" stroke="#14532d" strokeWidth="4" />
        <line x1="340" y1="205" x2="340" y2="235" stroke="#14532d" strokeWidth="4" />

        {/* 5. TWO PEOPLE SHARING FOOD ON TOP OF THE BRIDGE */}
        {/* Left Person (Green) */}
        {/* Head */}
        <circle cx="215" cy="105" r="13" fill="#14532d" />
        {/* Body bending in */}
        <path
          d="M 195,150 
             Q 200,125 218,125 
             Q 235,125 245,138 
             Q 255,142 265,140
             C 260,148 245,152 235,145
             L 215,160 Z"
          fill="#14532d"
        />

        {/* Right Person (Orange) */}
        {/* Head */}
        <circle cx="295" cy="105" r="13" fill="#f97316" />
        {/* Body bending in */}
        <path
          d="M 315,150 
             Q 310,125 292,125 
             Q 275,125 265,138 
             Q 255,142 245,140
             C 250,148 265,152 275,145
             L 295,160 Z"
          fill="#f97316"
        />

        {/* Hot Bowl being shared */}
        <path
          d="M 240,140 
             C 240,158 270,158 270,140 Z"
          fill="#166534"
        />
        {/* Warm steam lines */}
        <path d="M 248,132 Q 251,124 248,116" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
        <path d="M 255,130 Q 258,120 255,110" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 262,132 Q 265,124 262,116" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />

        {/* Small Leaf on Bowl */}
        <path d="M 270,135 Q 284,128 278,118 Q 266,128 270,135 Z" fill="#22c55e" />

        {/* 6. BOTTOM BOWL AND LEAF DESIGN */}
        {/* Solid green crescent/bowl at bottom */}
        <path
          d="M 195,275 
             C 195,335 315,335 315,275
             C 285,295 225,295 195,275 Z"
          fill="#0f2914"
        />

        {/* Big leaf overlapping bottom right */}
        <path
          d="M 265,260 
             Q 335,260 325,320 
             Q 260,310 265,260"
          fill="url(#leafGrad)"
        />
        {/* Leaf central vein */}
        <path
          d="M 265,260 Q 295,285 325,320"
          fill="none"
          stroke="#bbf7d0"
          strokeWidth="2"
        />
      </svg>

      {/* TEXT LABEL (Optionally visible) */}
      {showText && (
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-green-900 tracking-tight leading-none">
            Bhojan<span className="text-orange-500">Setu</span>
          </h1>
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">
            No Food Wasted, No Plate Empty
          </p>
        </div>
      )}
    </div>
  );
};
