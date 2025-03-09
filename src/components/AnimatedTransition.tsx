
import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface AnimatedTransitionProps {
  children: ReactNode;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div key={location.pathname} className="animate-scale-in w-full">
      {children}
    </div>
  );
};

export default AnimatedTransition;
