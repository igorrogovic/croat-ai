import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message: string;
  progress?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message, progress = 0 }) => {
  return (
    <div className="text-center py-12 max-w-md mx-auto">
      <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-6" />
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Analyzing Website</h3>
      <p className="text-slate-600 mb-6">{message}</p>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-right">{Math.round(Math.min(100, Math.max(0, progress)))}%</p>
    </div>
  );
};
