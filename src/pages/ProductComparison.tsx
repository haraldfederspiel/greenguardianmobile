
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Droplet, Leaf, Recycle, Zap } from 'lucide-react';
import SustainabilityScore from '../components/SustainabilityScore';
import { Product } from '../components/ProductCard';
import { useToast } from '@/components/ui/use-toast';
import { LucideIcon } from 'lucide-react';

// Sample data with updated image URLs
const originalProduct: Product = {
  id: '1',
  name: 'Standard Water Bottle',
  brand: 'AquaBasic',
  image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGxhc3RpYyUyMHdhdGVyJTIwYm90dGxlfGVufDB8fDB8fHww',
  price: '$14.99',
  sustainabilityScore: 42,
  category: 'Drinkware'
};

const alternativeProducts: Product[] = [
  {
    id: '1a',
    name: 'Eco-friendly Water Bottle',
    brand: 'GreenLife',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdhdGVyJTIwYm90dGxlfGVufDB8fDB8fHww',
    price: '$24.99',
    sustainabilityScore: 92,
    category: 'Drinkware'
  },
  {
    id: '1b',
    name: 'Recycled Plastic Bottle',
    brand: 'EcoFlow',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdhdGVyJTIwYm90dGxlfGVufDB8fDB8fHww',
    price: '$19.99',
    sustainabilityScore: 78,
    category: 'Drinkware'
  }
];

interface ComparisonMetric {
  name: string;
  icon: LucideIcon;
  original: number; // Percentage (0-100)
  alternative: number;
  label: string;
}

const ProductComparison: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product] = useState<Product>(originalProduct);
  const [alternatives] = useState<Product[]>(alternativeProducts);
  const [selectedAlternative, setSelectedAlternative] = useState<Product | null>(null);
  
  // Set the first alternative as default
  useEffect(() => {
    if (alternatives.length > 0 && !selectedAlternative) {
      setSelectedAlternative(alternatives[0]);
    }
  }, [alternatives, selectedAlternative]);
  
  // Comparison metrics
  const comparisonMetrics: ComparisonMetric[] = [
    {
      name: 'Carbon Footprint',
      icon: Leaf,
      original: 40,
      alternative: selectedAlternative ? (selectedAlternative.sustainabilityScore > 80 ? 85 : 65) : 0,
      label: 'kg CO2'
    },
    {
      name: 'Water Usage',
      icon: Droplet,
      original: 45,
      alternative: selectedAlternative ? (selectedAlternative.sustainabilityScore > 80 ? 88 : 70) : 0,
      label: 'liters'
    },
    {
      name: 'Energy Efficiency',
      icon: Zap,
      original: 50,
      alternative: selectedAlternative ? (selectedAlternative.sustainabilityScore > 80 ? 90 : 75) : 0,
      label: 'kWh'
    },
    {
      name: 'Recyclability',
      icon: Recycle,
      original: 30,
      alternative: selectedAlternative ? (selectedAlternative.sustainabilityScore > 80 ? 95 : 80) : 0,
      label: 'percentage'
    }
  ];
  
  const handleChooseAlternative = () => {
    if (selectedAlternative) {
      toast({
        title: "Great choice!",
        description: "You've earned 25 Green Points for choosing a sustainable alternative.",
        duration: 5000,
      });
      
      // In a real app, we would save this choice to the user's profile
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };
  
  if (!selectedAlternative) {
    return <div>Loading comparison...</div>;
  }
  
  return (
    <div className="animate-fade-in pb-8">
      <header className="mb-6 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="mr-3 p-2 rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Product Comparison</h1>
          <p className="text-neutral-500 text-sm">Find a sustainable alternative</p>
        </div>
      </header>
      
      {/* Products comparison */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Original product */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium">Original</h3>
            <SustainabilityScore score={product.sustainabilityScore} size="sm" showLabel={false} />
          </div>
          <div className="bg-white rounded-lg overflow-hidden mb-2 aspect-square">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h4 className="font-medium text-sm truncate">{product.name}</h4>
          <p className="text-xs text-neutral-500 mb-1">{product.brand}</p>
          <p className="font-semibold text-sm">{product.price}</p>
        </div>
        
        {/* Alternative product */}
        <div className="glass-card rounded-xl p-4 border-2 border-green-500">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <h3 className="text-sm font-medium">Alternative</h3>
              <div className="bg-green-100 rounded-full p-0.5 ml-1">
                <Leaf size={14} className="text-green-600" />
              </div>
            </div>
            <SustainabilityScore score={selectedAlternative.sustainabilityScore} size="sm" showLabel={false} />
          </div>
          <div className="bg-white rounded-lg overflow-hidden mb-2 aspect-square">
            <img 
              src={selectedAlternative.image} 
              alt={selectedAlternative.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h4 className="font-medium text-sm truncate">{selectedAlternative.name}</h4>
          <p className="text-xs text-neutral-500 mb-1">{selectedAlternative.brand}</p>
          <p className="font-semibold text-sm">{selectedAlternative.price}</p>
        </div>
      </div>
      
      {/* Alternative options */}
      {alternatives.length > 1 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-3">Alternative Options</h3>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {alternatives.map(alt => (
              <button
                key={alt.id}
                onClick={() => setSelectedAlternative(alt)}
                className={`flex-shrink-0 rounded-lg overflow-hidden w-16 h-16 ${
                  selectedAlternative?.id === alt.id ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <img 
                  src={alt.image} 
                  alt={alt.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Comparison metrics */}
      <div className="mb-8">
        <h3 className="text-sm font-medium mb-3">Sustainability Comparison</h3>
        <div className="space-y-4">
          {comparisonMetrics.map((metric, index) => (
            <div key={index} className="glass-card rounded-xl p-4">
              <div className="flex items-center mb-2">
                <div className="bg-green-100 rounded-full p-1.5 mr-2">
                  <metric.icon size={16} className="text-green-600" />
                </div>
                <h4 className="text-sm font-medium">{metric.name}</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-neutral-400 rounded-full"
                      style={{ width: `${metric.original}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-neutral-500">Original</span>
                    <span className="text-xs font-medium">{metric.original}%</span>
                  </div>
                </div>
                
                <div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${metric.alternative}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-neutral-500">Alternative</span>
                    <span className="text-xs font-medium">{metric.alternative}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action button */}
      <button
        onClick={handleChooseAlternative}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-green-500/20 transition-all duration-300 flex items-center justify-center"
      >
        <Check size={18} className="mr-2" />
        Choose This Alternative
      </button>
    </div>
  );
};

export default ProductComparison;
