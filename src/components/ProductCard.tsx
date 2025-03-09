
import React from 'react';
import { ChevronRight, Leaf } from 'lucide-react';
import SustainabilityScore from './SustainabilityScore';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  sustainabilityScore: number;
  brand: string;
  category?: string;
  tags?: string[];
  description?: string;
}

interface ProductCardProps {
  product: Product;
  showComparison?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showComparison = false }) => {
  // Fallback image based on category (if provided)
  const getFallbackImage = () => {
    const category = product.category?.toLowerCase() || '';
    
    if (category.includes('food') || category.includes('grocery')) {
      return 'https://images.unsplash.com/photo-1580428456289-31892e500545';
    } else if (category.includes('cosmetic') || category.includes('beauty')) {
      return 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b';
    } else {
      return 'https://images.unsplash.com/photo-1580428456289-31892e500545';
    }
  };
  
  // Format price display
  const displayPrice = product.price && product.price !== 'Not Available' 
    ? product.price 
    : 'Price not available';

  return (
    <div className="glass-card rounded-2xl p-4 mb-4 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-start">
        <div className="relative bg-white rounded-xl overflow-hidden h-20 w-20 mr-4 flex-shrink-0">
          <img 
            src={product.image} 
            alt={product.name} 
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.src = getFallbackImage();
            }}
          />
          {product.sustainabilityScore >= 80 && (
            <div className="absolute top-0 right-0 bg-green-500 p-0.5 rounded-bl-lg">
              <Leaf size={14} className="text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="font-medium text-sm truncate max-w-[140px]">{product.name}</h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{product.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs text-neutral-500 mb-1">{product.brand}</p>
              <p className="font-semibold text-sm">{displayPrice}</p>
            </div>
            
            <SustainabilityScore score={product.sustainabilityScore} size="sm" />
          </div>
          
          {product.description && (
            <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{product.description}</p>
          )}
        </div>
      </div>
      
      {showComparison && (
        <Link 
          to={`/compare/${product.id}`} 
          className="mt-3 pt-2 border-t border-neutral-100 text-sm text-green-600 flex items-center justify-between w-full"
        >
          <span>View alternatives</span>
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
};

export default ProductCard;
