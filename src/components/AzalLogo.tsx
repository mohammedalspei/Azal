import React from 'react';

interface AzalLogoProps {
  variant?: 'light' | 'dark' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const AzalLogo: React.FC<AzalLogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = true
}) => {
  const isWhite = variant === 'white';
  
  const sizeClasses = {
    sm: { icon: 'w-7 h-7', title: 'text-lg', sub: 'text-[10px]', padding: 'p-1' },
    md: { icon: 'w-9 h-9', title: 'text-xl', sub: 'text-xs', padding: 'p-1.5' },
    lg: { icon: 'w-12 h-12', title: 'text-2xl', sub: 'text-sm', padding: 'p-2' },
    xl: { icon: 'w-16 h-16', title: 'text-3xl', sub: 'text-base', padding: 'p-2.5' }
  }[size];

  return (
    <div className="flex items-center gap-2.5 select-none" id="azal-brand-logo">
      {/* Visual Logo Emblem */}
      <div className={`relative flex items-center justify-center rounded-xl transition-transform hover:scale-105 ${
        isWhite 
          ? 'bg-white/10 text-white border border-white/20' 
          : 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white shadow-md shadow-blue-900/20'
      } ${sizeClasses.padding} ${sizeClasses.icon}`}>
        
        {/* Stylized Glasses & Soundwaves Symbol */}
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Eyeglasses Frame */}
          <circle cx="15" cy="24" r="9" stroke="currentColor" strokeWidth="2.8" className="text-white" />
          <circle cx="33" cy="24" r="9" stroke="currentColor" strokeWidth="2.8" className="text-white" />
          {/* Bridge */}
          <path d="M24 21C24 19 24 19 24 21M21 21C22.5 19.5 25.5 19.5 27 21" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          {/* Sound waves (Hearing aspect) */}
          <path d="M4 17C2 21 2 27 4 31" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M44 17C46 21 46 27 44 31" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" />
          {/* Azal Accent dot */}
          <circle cx="24" cy="26" r="2" fill="#ef4444" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-extrabold tracking-tight font-tajawal ${
            isWhite ? 'text-white' : 'text-slate-900'
          } ${sizeClasses.title}`}>
            مركز <span className="text-red-600 font-black tracking-normal">آزال</span>
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
            isWhite ? 'bg-red-500/20 text-red-300 border border-red-400/30' : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            Azal
          </span>
        </div>

        {showSubtitle && (
          <span className={`font-semibold tracking-wide ${
            isWhite ? 'text-blue-200/90' : 'text-blue-900 font-bold'
          } ${sizeClasses.sub}`}>
            للنظارات والسمعيات
          </span>
        )}
      </div>
    </div>
  );
};
