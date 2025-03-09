
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import AnimatedTransition from './AnimatedTransition';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative bg-neutral-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full blur-3xl opacity-30 animate-pulse-gentle" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100 rounded-full blur-3xl opacity-30 animate-pulse-gentle" />
      
      {/* Main content */}
      <main className="flex-1 flex flex-col relative z-10 pt-6 pb-20 px-4 max-w-md mx-auto w-full">
        <AnimatedTransition>
          <Outlet />
        </AnimatedTransition>
      </main>
      
      {/* Fixed navigation */}
      <Navigation />
    </div>
  );
};

export default Layout;
