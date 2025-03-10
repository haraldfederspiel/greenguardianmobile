import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Droplet, Leaf, Recycle, Zap } from 'lucide-react';
import SustainabilityScore from '../components/SustainabilityScore';
import { Product } from '../components/ProductCard';
import { useToast } from '@/components/ui/use-toast';
import { LucideIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

// Sample alternative products (fallback)
const alternativeProducts: Product[] = [{
  id: '1a',
  name: 'Eco-friendly Water Bottle',
  brand: 'GreenLife',
  image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdhdGVyJTIwYm90dGxlfGVufDB8fDB8fHww',
  price: '$24.99',
  sustainabilityScore: 92,
  category: 'Drinkware'
}, {
  id: '1b',
  name: 'Recycled Plastic Bottle',
  brand: 'EcoFlow',
  image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdhdGVyJTIwYm90dGxlfGVufDB8fDB8fHww',
  price: '$19.99',
  sustainabilityScore: 78,
  category: 'Drinkware'
}];

// Generate more meaningful product name and brand based on ingredients
const getProductMetadata = (ingredients: string[] | undefined): {
  name: string;
  brand: string;
  category: string;
} => {
  if (!ingredients || ingredients.length === 0) {
    return {
      name: 'Personal Care Product',
      brand: 'Eco Brand',
      category: 'Personal Care'
    };
  }

  // Check first few ingredients to categorize product
  const ingredientsList = ingredients.slice(0, 5).map(i => i.toLowerCase());

  // Cosmetics/Skincare ingredients
  const cosmeticIngredients = ['aqua', 'water', 'glycerin', 'parfum', 'fragrance', 'paraben', 'alcohol', 'sodium', 'acid', 'extract', 'oil', 'butter', 'vitamin', 'dimethicone', 'silica', 'titanium', 'zinc', 'oxide', 'stearate'];

  // Food ingredients
  const foodIngredients = ['sugar', 'salt', 'flour', 'oil', 'water', 'milk', 'egg', 'protein', 'vitamin', 'mineral', 'flavor', 'extract', 'powder', 'syrup', 'juice'];

  // Check for cosmetics
  const cosmeticMatches = ingredientsList.filter(i => cosmeticIngredients.some(ci => i.includes(ci))).length;

  // Check for food
  const foodMatches = ingredientsList.filter(i => foodIngredients.some(fi => i.includes(fi))).length;

  // Determine category based on ingredient matches
  if (cosmeticMatches > foodMatches) {
    const specificNames = [{
      keywords: ['sodium laureth sulfate', 'sodium lauryl', 'cocamidopropyl'],
      name: 'Shampoo',
      brand: 'Pure Care'
    }, {
      keywords: ['glycerin', 'paraben', 'lanolin', 'aloe'],
      name: 'Moisturizer',
      brand: 'Skin Therapy'
    }, {
      keywords: ['titanium dioxide', 'mica', 'talc', 'silica'],
      name: 'Foundation',
      brand: 'Color Beauty'
    }, {
      keywords: ['salicylic', 'benzoyl', 'niacinamide'],
      name: 'Acne Treatment',
      brand: 'Clear Skin'
    }, {
      keywords: ['sodium fluoride', 'hydrated silica'],
      name: 'Toothpaste',
      brand: 'Bright Smile'
    }];
    for (const type of specificNames) {
      if (ingredientsList.some(i => type.keywords.some(k => i.includes(k)))) {
        return {
          name: type.name,
          brand: type.brand,
          category: 'Personal Care'
        };
      }
    }
    return {
      name: 'Skin Care Product',
      brand: 'Natural Beauty',
      category: 'Cosmetics'
    };
  } else if (foodMatches > 0) {
    const specificFoods = [{
      keywords: ['corn', 'syrup', 'sugar', 'fructose'],
      name: 'Sweet Snack',
      brand: 'Tasty Treats'
    }, {
      keywords: ['sodium', 'salt', 'monosodium'],
      name: 'Savory Snack',
      brand: 'Crunchy Bites'
    }, {
      keywords: ['milk', 'cream', 'lactose'],
      name: 'Dairy Product',
      brand: 'Creamy Delight'
    }, {
      keywords: ['flour', 'wheat', 'gluten'],
      name: 'Baked Good',
      brand: 'Bakery Fresh'
    }];
    for (const food of specificFoods) {
      if (ingredientsList.some(i => food.keywords.some(k => i.includes(k)))) {
        return {
          name: food.name,
          brand: food.brand,
          category: 'Food'
        };
      }
    }
    return {
      name: 'Food Product',
      brand: 'Organic Choice',
      category: 'Food'
    };
  }

  // Default case
  return {
    name: 'Consumer Product',
    brand: 'Eco Choice',
    category: 'General'
  };
};

// Generate alternative products based on category and sustainabilityScore
const generateAlternatives = async (product: Product): Promise<Product[]> => {
  // Default alternatives if no category/score
  if (!product || product.sustainabilityScore === undefined) {
    return alternativeProducts;
  }

  // Use the database to look for sustainable alternatives
  try {
    const {
      data,
      error
    } = await supabase.from('Sustainable products DB').select('*').limit(3);
    if (error || !data || data.length === 0) {
      console.error('Error fetching alternatives or no data found:', error);
      return generateFallbackAlternatives(product);
    }

    // Map the database results to Product objects
    return data.map((item, index) => ({
      id: `db-alt-${index}`,
      name: item['Product Name'] || 'Eco Alternative',
      brand: 'EcoChoice',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdhdGVyJTIwYm90dGxlfGVufDB8fDB8fHww',
      price: item.Price || 'Premium Price',
      sustainabilityScore: Math.min(product.sustainabilityScore + 30 + index * 5, 98),
      category: product.category || 'Sustainable Product'
    }));
  } catch (e) {
    console.error('Error in alternatives generation:', e);
    return generateFallbackAlternatives(product);
  }
};

// Fallback function to generate alternatives
const generateFallbackAlternatives = (product: Product): Product[] => {
  // Generate alternatives with higher sustainability scores
  const targetScore = Math.min(product.sustainabilityScore + 30, 95);
  const alternativeImages = ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdhdGVyJTIwYm90dGxlfGVufDB8fDB8fHww', 'https://images.unsplash.com/photo-1556228578-8c89e6e8ad70?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGVjbyUyMGZyaWVuZGx5fGVufDB8fDB8fHww', 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVjeWNsZWQlMjBwcm9kdWN0fGVufDB8fDB8fHww'];

  // Alternative names and brands based on category
  const getAltNamesForCategory = (category?: string) => {
    category = (category || 'product').toLowerCase();
    if (category.includes('food') || category.includes('snack')) {
      return [{
        name: `Organic ${category}`,
        brand: 'NatureFoods'
      }, {
        name: `Sustainable ${category}`,
        brand: 'EcoHarvest'
      }];
    } else if (category.includes('cosmetic') || category.includes('care') || category.includes('beauty')) {
      return [{
        name: `Natural ${category}`,
        brand: 'PureBeauty'
      }, {
        name: `Eco-friendly ${category}`,
        brand: 'GreenGlow'
      }];
    } else {
      return [{
        name: `Eco-friendly ${product.category || 'Product'}`,
        brand: 'GreenLife'
      }, {
        name: `Recycled ${product.category || 'Product'}`,
        brand: 'EcoFlow'
      }];
    }
  };
  const altNames = getAltNamesForCategory(product.category);
  return [{
    id: 'alt1',
    name: altNames[0].name,
    brand: altNames[0].brand,
    image: alternativeImages[0],
    price: 'Premium Price',
    sustainabilityScore: targetScore,
    category: product.category || 'Sustainable Alternative'
  }, {
    id: 'alt2',
    name: altNames[1].name,
    brand: altNames[1].brand,
    image: alternativeImages[1],
    price: 'Standard Price',
    sustainabilityScore: Math.max(targetScore - 15, product.sustainabilityScore + 20),
    category: product.category || 'Sustainable Alternative'
  }];
};
interface ComparisonMetric {
  name: string;
  icon: LucideIcon;
  original: number; // Percentage (0-100)
  alternative: number;
  label: string;
}
const ProductComparison: React.FC = () => {
  const {
    productId
  } = useParams<{
    productId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();

  // Get product data from location state if available (for custom products)
  const customProduct = location.state?.originalProduct;
  const [product, setProduct] = useState<Product>(customProduct || originalProduct);
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [selectedAlternative, setSelectedAlternative] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate alternatives based on the product
  useEffect(() => {
    const initializeComparison = async () => {
      setIsLoading(true);
      try {
        // If we have a custom product with ingredients data, use it to improve the product metadata
        if (customProduct && location.state?.ingredientsData) {
          const ingredientsData = location.state.ingredientsData;
          const metadata = getProductMetadata(ingredientsData.ingredients);

          // Create an enhanced product with better metadata
          const enhancedProduct = {
            ...customProduct,
            name: metadata.name,
            brand: metadata.brand,
            category: metadata.category
          };
          setProduct(enhancedProduct);

          // Generate alternatives based on the enhanced product
          const altProducts = await generateAlternatives(enhancedProduct);
          setAlternatives(altProducts);

          // Set first alternative as default
          if (altProducts.length > 0) {
            setSelectedAlternative(altProducts[0]);
          }
        } else {
          // Generate alternatives for the default product
          const altProducts = await generateAlternatives(product);
          setAlternatives(altProducts);

          // Set first alternative as default
          if (altProducts.length > 0) {
            setSelectedAlternative(altProducts[0]);
          }
        }
      } catch (error) {
        console.error('Error initializing comparison:', error);
        toast({
          title: "Error loading comparison",
          description: "Could not load product alternatives. Using default options.",
          variant: "destructive"
        });

        // Use fallback alternatives
        const fallbackAlts = generateFallbackAlternatives(product);
        setAlternatives(fallbackAlts);
        if (fallbackAlts.length > 0) {
          setSelectedAlternative(fallbackAlts[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    initializeComparison();
  }, [customProduct]);

  // Generate comparison metrics based on the selected alternative
  const generateComparisonMetrics = (): ComparisonMetric[] => {
    if (!selectedAlternative) return [];

    // Scale metrics based on sustainability score differences
    const scoreDifference = selectedAlternative.sustainabilityScore - product.sustainabilityScore;
    const improvementFactor = Math.max(0.2, Math.min(0.6, scoreDifference / 100)); // 20-60% improvement

    return [{
      name: 'Carbon Footprint',
      icon: Leaf,
      original: Math.min(100, Math.max(20, 100 - product.sustainabilityScore)),
      // Higher score = lower footprint
      alternative: Math.min(95, Math.max(product.sustainabilityScore + improvementFactor * 50, 65)),
      label: 'kg CO2'
    }, {
      name: 'Water Usage',
      icon: Droplet,
      original: Math.min(100, Math.max(25, 100 - product.sustainabilityScore * 0.9)),
      alternative: Math.min(95, Math.max(product.sustainabilityScore + improvementFactor * 45, 70)),
      label: 'liters'
    }, {
      name: 'Energy Efficiency',
      icon: Zap,
      original: Math.min(100, Math.max(30, product.sustainabilityScore)),
      alternative: Math.min(95, Math.max(product.sustainabilityScore + improvementFactor * 40, 75)),
      label: 'kWh'
    }, {
      name: 'Recyclability',
      icon: Recycle,
      original: Math.min(100, Math.max(20, product.sustainabilityScore - 10)),
      alternative: Math.min(95, Math.max(product.sustainabilityScore + improvementFactor * 55, 80)),
      label: 'percentage'
    }];
  };
  const handleChooseAlternative = () => {
    if (selectedAlternative) {
      toast({
        title: "Great choice!",
        description: "You've earned 25 Green Points for choosing a sustainable alternative.",
        duration: 5000
      });

      // In a real app, we would save this choice to the user's profile
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  // Loading state
  if (isLoading) {
    return <div className="flex flex-col items-center justify-center h-full animate-pulse">
        <p className="text-neutral-500">Loading comparison data...</p>
      </div>;
  }

  // No alternative found
  if (!selectedAlternative) {
    return <div className="flex flex-col items-center justify-center h-full">
        <p className="text-neutral-500 mb-4">Could not find alternatives for this product.</p>
        <button onClick={() => navigate(-1)} className="bg-neutral-200 hover:bg-neutral-300 px-4 py-2 rounded-lg">
          Go Back
        </button>
      </div>;
  }
  const comparisonMetrics = generateComparisonMetrics();
  return <div className="animate-fade-in pb-8">
      <header className="mb-6 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-3 p-2 rounded-full bg-white shadow-sm">
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
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
            <img src={selectedAlternative.image} alt={selectedAlternative.name} className="w-full h-full object-cover" />
          </div>
          <h4 className="font-medium text-sm truncate">{selectedAlternative.name}</h4>
          <p className="text-xs text-neutral-500 mb-1">{selectedAlternative.brand}</p>
          <p className="font-semibold text-sm">{selectedAlternative.price}</p>
        </div>
      </div>
      
      {/* Alternative options */}
      {alternatives.length > 1 && <div className="mb-8">
          
          
        </div>}
      
      {/* Comparison metrics */}
      <div className="mb-8">
        <h3 className="text-sm font-medium mb-3">Sustainability Comparison</h3>
        <div className="space-y-4">
          {comparisonMetrics.map((metric, index) => <div key={index} className="glass-card rounded-xl p-4">
              <div className="flex items-center mb-2">
                <div className="bg-green-100 rounded-full p-1.5 mr-2">
                  <metric.icon size={16} className="text-green-600" />
                </div>
                <h4 className="text-sm font-medium">{metric.name}</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-400 rounded-full" style={{
                  width: `${metric.original}%`
                }}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-neutral-500">Original</span>
                    <span className="text-xs font-medium">{metric.original}%</span>
                  </div>
                </div>
                
                <div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{
                  width: `${metric.alternative}%`
                }}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-neutral-500">Alternative</span>
                    <span className="text-xs font-medium">{metric.alternative}%</span>
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </div>
      
      {/* Action button */}
      <button onClick={handleChooseAlternative} className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-green-500/20 transition-all duration-300 flex items-center justify-center">
        <Check size={18} className="mr-2" />
        Choose This Alternative
      </button>
    </div>;
};
export default ProductComparison;