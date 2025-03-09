
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Droplet, Leaf, Recycle, Zap } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import SustainabilityScore from '../components/SustainabilityScore';
import { Product } from '../components/ProductCard';
import { useToast } from '@/components/ui/use-toast';
import SustainableAlternative from '../components/SustainableAlternative';
import ComparisonMetric from '../components/ComparisonMetric';

// Default sample data as fallback
const defaultOriginalProduct: Product = {
  id: '1',
  name: 'Standard Water Bottle',
  brand: 'AquaBasic',
  image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGxhc3RpYyUyMHdhdGVyJTIwYm90dGxlfGVufDB8fDB8fHww',
  price: '$14.99',
  sustainabilityScore: 42,
  category: 'Drinkware'
};

const defaultAlternativeProducts: Product[] = [
  {
    id: '1a',
    name: 'Eco-friendly Water Bottle',
    brand: 'GreenLife',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdhdGVyJTIwYm90dGxlfGVufDB8fDB8fHww',
    price: '$24.99',
    sustainabilityScore: 92,
    category: 'Drinkware'
  }
];

// Image placeholder for products without images
const getImagePlaceholder = (category: string) => {
  const placeholders: Record<string, string> = {
    'Drinkware': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGxhc3RpYyUyMHdhdGVyJTIwYm90dGxlfGVufDB8fDB8fHww',
    'Food': 'https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3JvY2VyaWVzfGVufDB8fDB8fHww',
    'Cleaning': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2xlYW5pbmclMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D',
    'Cosmetics': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y29zbWV0aWNzfGVufDB8fDB8fHww',
    default: 'https://images.unsplash.com/photo-1580428456289-31892e500545?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  };
  
  return placeholders[category] || placeholders.default;
};

interface ComparisonMetricType {
  name: string;
  icon: LucideIcon;
  original: number;
  alternative: number;
  label: string;
}

interface ComparisonData {
  original: {
    name: string;
    brand: string;
    price: string;
    image?: string;
    sustainabilityScore: number;
    category?: string;
    id?: string;
  };
  alternatives: Array<{
    name: string;
    brand: string;
    price: string;
    image?: string;
    sustainabilityScore: number;
    category?: string;
    id?: string;
  }>;
  comparison: {
    carbonFootprint: { original: number; alternative: number; };
    waterUsage: { original: number; alternative: number; };
    energyEfficiency: { original: number; alternative: number; };
    recyclability: { original: number; alternative: number; };
  };
}

const ProductComparison: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product>(defaultOriginalProduct);
  const [alternatives, setAlternatives] = useState<Product[]>(defaultAlternativeProducts);
  const [selectedAlternative, setSelectedAlternative] = useState<Product | null>(null);
  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetricType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Set the first alternative as default
  useEffect(() => {
    if (alternatives.length > 0 && !selectedAlternative) {
      setSelectedAlternative(alternatives[0]);
    }
  }, [alternatives, selectedAlternative]);
  
  // Load comparison data from localStorage
  useEffect(() => {
    const loadComparisonData = () => {
      setIsLoading(true);
      try {
        const storedData = localStorage.getItem('productComparison');
        console.log('Raw stored data:', storedData);
        
        if (storedData) {
          try {
            const parsedData: ComparisonData = JSON.parse(storedData);
            console.log('Parsed comparison data:', parsedData);
            
            if (!parsedData.original || !parsedData.alternatives || !parsedData.comparison) {
              console.error('Invalid data format:', parsedData);
              throw new Error('Invalid data format');
            }
            
            // Process the original product
            const originalProduct: Product = {
              id: parsedData.original.id || 'original',
              name: parsedData.original.name || defaultOriginalProduct.name,
              brand: parsedData.original.brand || defaultOriginalProduct.brand,
              price: parsedData.original.price || '$14.99',
              sustainabilityScore: parsedData.original.sustainabilityScore || 60,
              category: parsedData.original.category || 'Food',
              image: parsedData.original.image || getImagePlaceholder('Food')
            };
            
            // Process the alternative products
            const alternativeProducts: Product[] = parsedData.alternatives.map((alt, index) => ({
              id: alt.id || `alt-${index}`,
              name: alt.name || `Alternative ${index + 1}`,
              brand: alt.brand || 'Eco Brand',
              price: alt.price || '$24.99',
              sustainabilityScore: alt.sustainabilityScore || 80,
              category: alt.category || originalProduct.category,
              image: alt.image || getImagePlaceholder(alt.category || 'default')
            }));
            
            // Normalize comparison values to percentages (0-100)
            const normalizeValue = (value: number): number => {
              // If value is already in 0-100 range, return it
              if (value >= 0 && value <= 100) return value;
              // If value is a small number (like 0.x), multiply it by 100
              if (value >= 0 && value < 1) return Math.round(value * 100);
              // Default to a value between 0-100
              return Math.min(100, Math.max(0, value));
            };
            
            // Set up comparison metrics
            const metrics: ComparisonMetricType[] = [
              {
                name: 'Carbon Footprint',
                icon: Leaf,
                original: normalizeValue(parsedData.comparison.carbonFootprint.original),
                alternative: normalizeValue(parsedData.comparison.carbonFootprint.alternative),
                label: 'percentage'
              },
              {
                name: 'Water Usage',
                icon: Droplet,
                original: normalizeValue(parsedData.comparison.waterUsage.original),
                alternative: normalizeValue(parsedData.comparison.waterUsage.alternative),
                label: 'percentage'
              },
              {
                name: 'Energy Efficiency',
                icon: Zap,
                original: normalizeValue(parsedData.comparison.energyEfficiency.original),
                alternative: normalizeValue(parsedData.comparison.energyEfficiency.alternative),
                label: 'percentage'
              },
              {
                name: 'Recyclability',
                icon: Recycle,
                original: normalizeValue(parsedData.comparison.recyclability.original),
                alternative: normalizeValue(parsedData.comparison.recyclability.alternative),
                label: 'percentage'
              }
            ];
            
            // Update state with the parsed data
            setProduct(originalProduct);
            setAlternatives(alternativeProducts);
            setComparisonMetrics(metrics);
            console.log('States updated with comparison data');
          } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            console.log('Invalid JSON string:', storedData);
            toast({
              title: "Error parsing data",
              description: "Invalid comparison data format. Using default data.",
              variant: "destructive",
            });
            // Use defaults
            setDefaultMetrics();
          }
        } else {
          console.log('No stored data found, using defaults');
          // Set default comparison metrics if no stored data
          setDefaultMetrics();
        }
      } catch (error) {
        console.error('Error loading comparison data:', error);
        toast({
          title: "Error loading comparison",
          description: "Could not load product comparison data. Using default data instead.",
          variant: "destructive",
        });
        
        // Set default comparison metrics on error
        setDefaultMetrics();
      } finally {
        setIsLoading(false);
      }
    };
    
    const setDefaultMetrics = () => {
      setComparisonMetrics([
        {
          name: 'Carbon Footprint',
          icon: Leaf,
          original: 40,
          alternative: 85,
          label: 'percentage'
        },
        {
          name: 'Water Usage',
          icon: Droplet,
          original: 45,
          alternative: 88,
          label: 'percentage'
        },
        {
          name: 'Energy Efficiency',
          icon: Zap,
          original: 50,
          alternative: 90,
          label: 'percentage'
        },
        {
          name: 'Recyclability',
          icon: Recycle,
          original: 30,
          alternative: 95,
          label: 'percentage'
        }
      ]);
    };
    
    loadComparisonData();
  }, [toast]);
  
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
        <p className="ml-3 text-neutral-600">Loading comparison...</p>
      </div>
    );
  }
  
  if (!selectedAlternative) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-neutral-600 mb-4">No alternatives found.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg"
        >
          Go back home
        </button>
      </div>
    );
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = getImagePlaceholder('default');
              }}
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = getImagePlaceholder('default');
              }}
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
              <SustainableAlternative
                key={alt.id}
                id={alt.id}
                name={alt.name}
                brand={alt.brand}
                price={alt.price}
                image={alt.image}
                score={alt.sustainabilityScore}
                isSelected={selectedAlternative?.id === alt.id}
                onClick={() => setSelectedAlternative(alt)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Comparison metrics */}
      <div className="mb-8">
        <h3 className="text-sm font-medium mb-3">Sustainability Comparison</h3>
        <div className="space-y-4">
          {comparisonMetrics.map((metric, index) => (
            <ComparisonMetric
              key={index}
              name={metric.name}
              icon={metric.icon}
              originalValue={metric.original}
              alternativeValue={metric.alternative}
              label={metric.label}
            />
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
