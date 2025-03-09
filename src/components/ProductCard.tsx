
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
}

interface ProductCardProps {
  product: Product;
  showComparison?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showComparison = false }) => {
  return (
    <div className="glass-card rounded-2xl p-4 mb-4 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-start">
        <div className="relative bg-white rounded-xl overflow-hidden h-20 w-20 mr-4 flex-shrink-0">
          <img 
            src={product.image} 
            alt={product.name} 
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
            loading="lazy"
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
              <h3 className="font-medium text-sm truncate max-w-[140px]">{product.name}</h3>
              <p className="text-xs text-neutral-500 mb-1">{product.brand}</p>
              <p className="font-semibold text-sm">{product.price}</p>
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
