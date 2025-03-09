
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, User } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/camera', icon: Camera, label: 'Camera' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-card mx-4 mb-6 rounded-2xl flex justify-around items-center h-16 shadow-lg">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-20 h-full transition-all duration-300 ${isActive ? 'text-primary font-medium' : 'text-neutral-500'}`}
            >
              <div className={`relative transition-all duration-300 ${isActive ? 'scale-105' : 'scale-100'}`}>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="nav-indicator"></span>
              </div>
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-6 w-12 h-1 bg-primary rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
