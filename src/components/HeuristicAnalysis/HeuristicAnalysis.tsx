import React from 'react';
import { HeuristicCategory } from '../../types/audit';
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface HeuristicAnalysisProps {
  categories: HeuristicCategory[];
}

export const HeuristicAnalysis: React.FC<HeuristicAnalysisProps> = ({ categories }) => {
  const getScoreColor = (score: number) => {
    if (score >= 3) return 'text-green-600 bg-green-50 border-green-200';
    if (score === 2) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
      if (score >= 3) return <CheckCircle className="w-5 h-5 text-green-600" />;
      if (score === 2) return <HelpCircle className="w-5 h-5 text-yellow-600" />;
      return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {categories.map((cat, idx) => (
        <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{cat.category}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {cat.items.map((item, i) => (
              <div key={i} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                      {getScoreIcon(item.score)}
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-md font-medium text-gray-900 mb-2">{item.question}</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded border border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Observation</span>
                            <p className="text-sm text-slate-700 mt-1">{item.observation}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded border border-blue-100">
                            <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Recommendation</span>
                            <p className="text-sm text-blue-800 mt-1">{item.recommendation}</p>
                        </div>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 px-3 py-1 rounded-full border text-sm font-bold ${getScoreColor(item.score)}`}>
                    Score: {item.score}/3
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
