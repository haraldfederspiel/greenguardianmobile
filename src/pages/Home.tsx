import React, { useState } from 'react';
import ProductCard, { Product } from '../components/ProductCard';
import { Leaf } from 'lucide-react';

// Sample product data
const sampleProducts: Product[] = [{
  id: '1',
  name: 'Eco-friendly Water Bottle',
  brand: 'GreenLife',
  image: '/placeholder.svg',
  price: '$24.99',
  sustainabilityScore: 92,
  tags: ['reusable', 'BPA-free']
}, {
  id: '2',
  name: 'Organic Cotton T-shirt',
  brand: 'EcoWear',
  image: '/placeholder.svg',
  price: '$29.99',
  sustainabilityScore: 85,
  tags: ['organic', 'fair-trade']
}, {
  id: '3',
  name: 'Bamboo Toothbrush',
  brand: 'EcoSmile',
  image: '/placeholder.svg',
  price: '$5.99',
  sustainabilityScore: 90,
  tags: ['biodegradable', 'plastic-free']
}, {
  id: '4',
  name: 'Recycled Paper Notebook',
  brand: 'GreenNotes',
  image: '/placeholder.svg',
  price: '$12.99',
  sustainabilityScore: 78,
  tags: ['recycled', 'tree-free']
}];
const Home: React.FC = () => {
  const [recentProducts] = useState<Product[]>(sampleProducts);

  // Total carbon saved calculation (simplified)
  const totalCarbonSaved = recentProducts.reduce((total, product) => total + product.sustainabilityScore / 100 * 2.5, 0).toFixed(2);
  return <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-center">GreenGuardian</h1>
        <p className="text-neutral-500 text-center">Your sustainable shopping assistant</p>
      </header>
      
      <div className="glass-card rounded-2xl p-5 mb-8 bg-green-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Your Impact</h2>
            <p className="text-green-600 font-medium text-lg">
              {totalCarbonSaved} kg CO<sub>2</sub> saved
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Based on your sustainable choices
            </p>
          </div>
          <div className="bg-white rounded-full p-3 shadow-md">
            <Leaf size={32} className="text-green-500" />
          </div>
        </div>
      </div>
      
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Products</h2>
        <button className="text-sm text-green-600">View all</button>
      </div>
      
      <div className="space-y-4 animate-slide-up" style={{
      animationDelay: '0.1s'
    }}>
        {recentProducts.length > 0 ? recentProducts.map(product => <ProductCard key={product.id} product={product} showComparison={true} />) : <div className="text-center py-8 text-neutral-500">
            <p>No recent products found</p>
            <p className="text-sm mt-2">Start by scanning a product</p>
          </div>}
      </div>
    </div>;
};
export default Home;