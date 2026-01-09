
import React from 'react';
import { PXLItem, calculatePXLScore } from '../../utils/pxlFramework';
import { Check } from 'lucide-react';

interface PXLTestTableProps {
  tests: PXLItem[];
}

export const PXLTestTable: React.FC<PXLTestTableProps> = ({ tests }) => {
  const sortedTests = [...tests].map(t => ({...t, score: calculatePXLScore(t)})).sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 tracking-wider text-xs">Test Hypothesis</th>
              <th className="px-6 py-3 text-center tracking-wider text-xs" title="Above the Fold? (1)">Above Fold</th>
              <th className="px-6 py-3 text-center tracking-wider text-xs" title="Noticeable < 5s? (2)">Noticeable</th>
              <th className="px-6 py-3 text-center tracking-wider text-xs" title="Adds/Removes? (2)">Add/Del</th>
              <th className="px-6 py-3 text-center tracking-wider text-xs" title="High Traffic? (1)">Traffic</th>
              <th className="px-6 py-3 text-center tracking-wider text-xs" title="Ease (3=Easy)">Ease</th>
              <th className="px-6 py-3 text-right tracking-wider text-xs">PXL Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedTests.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 mb-1">{test.title}</div>
                  <div className="text-xs text-gray-500 leading-relaxed max-w-sm">{test.hypothesis}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  {test.isAboveFold ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                </td>
                <td className="px-6 py-4 text-center">
                   {test.isNoticeableIn5Sec ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                </td>
                <td className="px-6 py-4 text-center">
                   {test.addsOrRemoves ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                </td>
                <td className="px-6 py-4 text-center">
                   {test.highTraffic ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium 
                      ${test.easeOfImplementation === 'Easy' ? 'bg-green-100 text-green-800' : 
                        test.easeOfImplementation === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {test.easeOfImplementation}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                      <div className="text-lg font-bold text-indigo-600">{test.score}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          <strong>PXL Prioritization Logic:</strong> Higher score = Higher priority. Features weighted on expected impact (visibility, change magnitude) and ease of implementation.
        </div>
      </div>
    </div>
  );
};
