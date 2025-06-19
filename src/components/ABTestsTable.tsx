import React from 'react';
import { FlaskConical, Target, TrendingUp, FileText } from 'lucide-react';
import { ABTest } from '../types/audit';

interface ABTestsTableProps {
  abTests: ABTest[];
}

export const ABTestsTable: React.FC<ABTestsTableProps> = ({ abTests }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-purple-50 border-b border-purple-200">
        <div className="flex items-center">
          <FlaskConical className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-medium text-purple-900">A/B Test Recommendations</h3>
        </div>
        <p className="text-sm text-purple-700 mt-1">
          Data-driven test ideas to optimize conversion rates
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full" role="grid">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48">
                <FileText className="inline h-4 w-4 mr-1" />
                Test Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">
                <Target className="inline h-4 w-4 mr-1" />
                Friction Point
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                Expected Lift
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {abTests.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {test.testName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    {test.frictionPoint}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-green-600 font-medium">
                  {test.expectedLift}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="max-w-xs">
                    {test.description}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};