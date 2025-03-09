
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ComparisonMetricProps {
  name: string;
  icon: LucideIcon;
  originalValue: number; // Percentage (0-100)
  alternativeValue: number;
  label?: string;
}

const ComparisonMetric: React.FC<ComparisonMetricProps> = ({
  name,
  icon: Icon,
  originalValue,
  alternativeValue,
  label
}) => {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center mb-2">
        <div className="bg-green-100 rounded-full p-1.5 mr-2">
          <Icon size={16} className="text-green-600" />
        </div>
        <h4 className="text-sm font-medium">{name}</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-neutral-400 rounded-full"
              style={{ width: `${originalValue}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-neutral-500">Original</span>
            <span className="text-xs font-medium">{originalValue}%</span>
          </div>
        </div>
        
        <div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${alternativeValue}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-neutral-500">Alternative</span>
            <span className="text-xs font-medium">{alternativeValue}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonMetric;
