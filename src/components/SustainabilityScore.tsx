
import React from 'react';

interface SustainabilityScoreProps {
  score: number; // Score from 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SustainabilityScore: React.FC<SustainabilityScoreProps> = ({ 
  score, 
  size = 'md', 
  showLabel = true 
}) => {
  // Determine the color based on score
  const getColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-green-400';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Determine the size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return { container: 'w-10 h-10', text: 'text-xs' };
      case 'lg': return { container: 'w-20 h-20', text: 'text-xl' };
      default: return { container: 'w-14 h-14', text: 'text-sm' };
    }
  };
  
  const sizeClasses = getSizeClasses();
  
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses.container} rounded-full flex items-center justify-center bg-neutral-100`}>
        <div 
          className={`absolute inset-0.5 rounded-full ${getColor()} transition-all duration-500 ease-out`}
          style={{ 
            clipPath: `inset(0 0 0 0 round 9999px)`,
            opacity: score / 100 
          }}
        />
        <span className={`relative font-bold ${sizeClasses.text} text-neutral-800`}>
          {score}
        </span>
      </div>
      {showLabel && (
        <span className="text-xs mt-1 text-neutral-500">
          {score >= 80 ? 'Excellent' : 
           score >= 60 ? 'Good' : 
           score >= 40 ? 'Average' : 
           score >= 20 ? 'Poor' : 'Bad'}
        </span>
      )}
    </div>
  );
};

export default SustainabilityScore;
