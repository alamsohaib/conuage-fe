
import React from 'react';
import { Brain } from 'lucide-react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 10, 
  className = '' 
}) => {
  return (
    <div 
      className={`w-${size} h-${size} bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md logo-shimmer ${className}`}
    >
      <Brain className="w-6 h-6 text-primary-foreground" />
    </div>
  );
};

export default Logo;
