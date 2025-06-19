import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <div className="text-center py-12">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-blue-600 font-medium">{message}</p>
    </div>
  );
};