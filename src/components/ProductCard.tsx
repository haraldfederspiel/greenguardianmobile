
import React from 'react';
import { ChevronRight, Leaf } from 'lucide-react';
import SustainabilityScore from './SustainabilityScore';
import { Link } from 'react-router-dom';

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
  ingredients?: string[];
}

interface ProductCardProps {
  product: Product;
  showComparison?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showComparison = false }) => {
  // Function to handle missing or invalid image URLs
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    
    // Set a category-specific fallback image
    if (product.category) {
      const categoryMappings: Record<string, string> = {
        'Food': 'https://images.unsplash.com/photo-1506617564039-2f3b650b7010',
        'Drinkware': 'https://images.unsplash.com/photo-1523362628745-0c100150b504',
        'Cleaning': 'https://images.unsplash.com/photo-1563453392212-326f5e854473',
        'Cosmetics': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b',
      };
      
      target.src = categoryMappings[product.category] || 'https://images.unsplash.com/photo-1580428456289-31892e500545';
    } else {
      // Generic fallback
      target.src = 'https://images.unsplash.com/photo-1580428456289-31892e500545';
    }
  };
  
  // Format price for display if it's "Not Available" or empty
  const displayPrice = (!product.price || product.price === "Not Available") 
    ? "Price not available" 
    : product.price;
  
  return (
    <div className="glass-card rounded-2xl p-4 mb-4 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-start">
        <div className="relative bg-white rounded-xl overflow-hidden h-20 w-20 mr-4 flex-shrink-0">
          <img 
            src={product.image} 
            alt={product.name} 
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
            loading="lazy"
            onError={handleImageError}
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
              <h3 className="font-medium text-sm truncate max-w-[140px]" title={product.name}>{product.name}</h3>
              <p className="text-xs text-neutral-500 mb-1">{product.brand}</p>
              <p className="font-semibold text-sm">{displayPrice}</p>
              {product.description && (
                <p className="text-xs text-neutral-600 mt-1 line-clamp-2" title={product.description}>
                  {product.description}
                </p>
              )}
            </div>
            
            <SustainabilityScore score={product.sustainabilityScore} size="sm" />
          </div>
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
