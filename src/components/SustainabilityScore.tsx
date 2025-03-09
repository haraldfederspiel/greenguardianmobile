
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
  // Handle NaN or invalid scores
  const validScore = (!isNaN(score) && score !== null) ? score : 0;
  
  // Determine the color based on score
  const getColor = () => {
    if (validScore >= 80) return 'bg-green-500';
    if (validScore >= 60) return 'bg-green-400';
    if (validScore >= 40) return 'bg-yellow-500';
    if (validScore >= 20) return 'bg-orange-500';
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
  const opacity = validScore / 100;
  
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses.container} rounded-full flex items-center justify-center bg-neutral-100`}>
        <div 
          className={`absolute inset-0.5 rounded-full ${getColor()} transition-all duration-500 ease-out`}
          style={{ 
            clipPath: `inset(0 0 0 0 round 9999px)`,
            opacity: isNaN(opacity) ? 0 : opacity
          }}
        />
        <span className={`relative font-bold ${sizeClasses.text} text-neutral-800`}>
          {validScore}
        </span>
      </div>
      {showLabel && (
        <span className="text-xs mt-1 text-neutral-500">
          {validScore >= 80 ? 'Excellent' : 
           validScore >= 60 ? 'Good' : 
           validScore >= 40 ? 'Average' : 
           validScore >= 20 ? 'Poor' : 'Bad'}
        </span>
      )}
    </div>
  );
};

export default SustainabilityScore;
