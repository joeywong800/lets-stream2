
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoProps {
  className?: string;
}

/**
 * A distinctive, modern logo component for the Let's Stream navigation bar.
 * Features overlapping letters, dynamic gradient colors, and engaging hover effects.
 */
export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <span
      className={`lets-stream-logo ${className}`}
      style={{
        fontSize: '1.7em',
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontWeight: '700',
        marginRight: '8px',
        verticalAlign: 'middle',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.3s ease',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.1em 0.3em',
        borderRadius: '8px',
        background: isHovered ? 
          'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))' : 
          'transparent',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
      title="Let's Stream"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate('/')}
    >
      <span style={{
        position: 'relative',
        display: 'inline-flex',
        letterSpacing: '-0.05em',
      }}>
        <span style={{
          position: 'relative',
          zIndex: 2,
          background: isHovered ? 
            'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)' : 
            'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: isHovered ? 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))' : 'none',
          transition: 'all 0.3s ease',
        }}>
          L
        </span>
        <span style={{
          marginLeft: '-0.15em',
          position: 'relative',
          zIndex: 1,
          background: isHovered ? 
            'linear-gradient(135deg, #EC4899 0%, #F59E0B 50%, #10B981 100%)' : 
            'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: isHovered ? 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.5))' : 'none',
          transition: 'all 0.3s ease',
        }}>
          S
        </span>
      </span>
      <span 
        style={{
          position: 'absolute',
          left: '0.3em',
          right: '0.3em',
          bottom: '0.1em',
          height: '2px',
          background: isHovered ? 
            'linear-gradient(90deg, #8B5CF6, #EC4899, #F59E0B)' : 
            'linear-gradient(90deg, #8B5CF6, #EC4899)',
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.3s ease',
          opacity: isHovered ? 1 : 0.7,
          borderRadius: '1px',
          boxShadow: isHovered ? '0 0 8px rgba(139, 92, 246, 0.3)' : 'none',
        }}
      />
    </span>
  );
};

export default Logo;
