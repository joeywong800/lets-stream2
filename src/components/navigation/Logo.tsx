
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center font-bold group relative py-2"
      aria-label="Let's Stream"
    >
      <div className="relative z-10 flex items-center logo-wave">
        <div className="mr-2 relative play-icon">
          <div className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white transform translate-x-[2px]"></div>
          </div>
        </div>
        
        <div className="flex items-baseline logo-container">
          <span className="text-2xl font-extrabold bg-gradient-to-tr from-red-400 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient bg-300% tracking-tight logo-float">
            BADBOYS
          </span>
          <span className="text-2xl font-extrabold ml-2 bg-gradient-to-br from-blue-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent animate-gradient bg-300% tracking-tight logo-breathe">
            FLIX
          </span>
          <div className="logo-shimmer absolute inset-0"></div>
        </div>
      </div>
      
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-md transform -rotate-6"></div>
      </div>

      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-80 transition-opacity duration-300">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-sparkle"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${Math.random() * 1 + 1}s`,
            }}
          />
        ))}
      </div>
    </Link>
  );
};

export default Logo;
