
import React from 'react';
import { Leaf } from 'lucide-react';
import SustainabilityScore from './SustainabilityScore';

interface SustainableAlternativeProps {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  score: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const SustainableAlternative: React.FC<SustainableAlternativeProps> = ({
  id,
  name,
  brand,
  price,
  image,
  score,
  isSelected = false,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`flex-shrink-0 ${isSelected ? 'border-2 border-green-500 rounded-xl' : ''}`}
    >
      <div className="bg-white rounded-lg overflow-hidden mb-2 aspect-square w-16 h-16">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      {score >= 80 && (
        <div className="bg-green-100 rounded-full p-0.5 mx-auto w-fit">
          <Leaf size={12} className="text-green-600" />
        </div>
      )}
    </div>
  );
};

export default SustainableAlternative;
