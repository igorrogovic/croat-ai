import React from 'react';
import { Zap, DollarSign, TrendingUp, Flag } from 'lucide-react';
import { QuickWin } from '../types/audit';

interface QuickWinsTableProps {
  quickWins: QuickWin[];
}

export const QuickWinsTable: React.FC<QuickWinsTableProps> = ({ quickWins }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-green-50 border-b border-green-200">
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-green-900">Quick Wins</h3>
        </div>
        <p className="text-sm text-green-700 mt-1">
          High-impact changes you can implement immediately
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full" role="grid">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">
                <Zap className="inline h-4 w-4 mr-1" />
                Change
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                Impact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Flag className="inline h-4 w-4 mr-1" />
                Priority
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quickWins.map((win) => (
              <tr key={win.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    {win.change}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {win.cost}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(win.impact)}`}>
                    {win.impact}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(win.priority)}`}>
                    {win.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};