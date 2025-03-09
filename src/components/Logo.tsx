
import React from 'react';
import { Leaf, Shield } from 'lucide-react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <Shield size={size} className="text-green-600 fill-green-100" />
      <Leaf size={size * 0.6} className="text-green-700 absolute" />
    </div>
  );
};

export default Logo;
