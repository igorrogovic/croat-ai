import React, { useMemo } from 'react';
import { ChevronDown, TrendingUp, Clock, Tag } from 'lucide-react';
import { AuditRecommendation } from '../types/audit';

interface RecommendationsTableProps {
  recommendations: AuditRecommendation[];
  visibleCount: number;
  onLoadMore: () => void;
  hasMore: boolean;
  pageType: string;
}

export const RecommendationsTable: React.FC<RecommendationsTableProps> = ({
  recommendations,
  visibleCount,
  onLoadMore,
  hasMore,
  pageType
}) => {
  const visibleRecommendations = useMemo(() => {
    return recommendations.slice(0, visibleCount);
  }, [recommendations, visibleCount]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{pageType} Recommendations</h3>
        <p className="text-sm text-gray-600 mt-1">
          Showing {visibleRecommendations.length} of {recommendations.length} recommendations
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full" role="grid">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">
                Observation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48">
                Strengths
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">
                Suggested Improvement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                Impact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Clock className="inline h-4 w-4 mr-1" />
                Effort
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Tag className="inline h-4 w-4 mr-1" />
                Section
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visibleRecommendations.map((rec) => (
              <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    {rec.observation}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="max-w-xs">
                    {rec.strengths}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    {rec.suggestedImprovement}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getImpactColor(rec.impact)}`}>
                    {rec.impact}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getEffortColor(rec.effort)}`}>
                    {rec.effort}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {rec.section}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {hasMore && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
          <button
            onClick={onLoadMore}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            Load More Recommendations
          </button>
        </div>
      )}
    </div>
  );
};