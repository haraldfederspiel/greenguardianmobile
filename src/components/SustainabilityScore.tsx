
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
  
  // Get text color based on score
  const getTextColor = () => {
    if (validScore >= 60) return 'text-green-700';
    if (validScore >= 40) return 'text-yellow-700';
    return 'text-red-700';
  };
  
  // Determine the size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return { container: 'w-10 h-10', text: 'text-xs', strokeWidth: 2 };
      case 'lg': return { container: 'w-20 h-20', text: 'text-xl', strokeWidth: 4 };
      default: return { container: 'w-14 h-14', text: 'text-sm', strokeWidth: 3 };
    }
  };
  
  const sizeClasses = getSizeClasses();
  const circumference = 2 * Math.PI * 45; // Based on radius of 45 (used in the SVG)
  const offset = circumference - (validScore / 100) * circumference;
  const opacity = validScore / 100;
  
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses.container} flex items-center justify-center`}>
        {/* SVG ring for progress indicator */}
        <svg className="absolute w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle 
            className="text-neutral-100" 
            strokeWidth={sizeClasses.strokeWidth} 
            stroke="currentColor" 
            fill="none" 
            cx="50" 
            cy="50" 
            r="45"
          />
          {/* Progress circle */}
          <circle 
            className={`transition-all duration-700 ease-out ${getColor().replace('bg-', 'text-')}`}
            strokeWidth={sizeClasses.strokeWidth} 
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            cx="50" 
            cy="50" 
            r="45" 
            transform="rotate(-90 50 50)"
          />
        </svg>
        {/* Number display */}
        <span className={`relative font-bold ${sizeClasses.text} ${getTextColor()}`}>
          {validScore}
        </span>
      </div>
      {showLabel && (
        <span className={`text-xs mt-1 font-medium ${getTextColor()}`}>
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
