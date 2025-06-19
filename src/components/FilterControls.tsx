import React from 'react';
import { Filter } from 'lucide-react';
import { FilterState } from '../types/audit';

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableSections: string[];
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  availableSections
}) => {
  const impactOptions = ['All', 'High', 'Medium', 'Low'];
  const effortOptions = ['All', 'High', 'Medium', 'Low'];
  const sectionOptions = ['All', ...availableSections];

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <Filter className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="font-medium text-gray-900">Filter Recommendations</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
          <select
            value={filters.impact}
            onChange={(e) => onFilterChange({ ...filters, impact: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {impactOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Effort</label>
          <select
            value={filters.effort}
            onChange={(e) => onFilterChange({ ...filters, effort: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {effortOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select
            value={filters.section}
            onChange={(e) => onFilterChange({ ...filters, section: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {sectionOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};