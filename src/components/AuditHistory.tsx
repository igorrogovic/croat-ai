import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Clock, ExternalLink, Trash2 } from 'lucide-react';
import { AuditResult } from '../types/audit';
import { getUserAuditResults, clearUserAuditResults } from '../utils/userStorage';
import { ProtectedFeature } from './ProtectedFeature';

interface AuditHistoryProps {
  onSelectAudit: (audit: AuditResult) => void;
}

export function AuditHistory({ onSelectAudit }: AuditHistoryProps) {
  const { user } = useUser();
  const [audits, setAudits] = React.useState<AuditResult[]>([]);

  React.useEffect(() => {
    if (user) {
      const userAudits = getUserAuditResults(user.id);
      setAudits(userAudits);
    }
  }, [user]);

  const handleClearHistory = () => {
    if (user && window.confirm('Are you sure you want to clear your audit history?')) {
      clearUserAuditResults(user.id);
      setAudits([]);
    }
  };

  const formatDate = (generatedAt: number) => {
    return new Date(generatedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const content = (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Audit History</h3>
        {audits.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {audits.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No audit history yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Your completed audits will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((audit, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onSelectAudit(audit)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-900 truncate">
                      {audit.websiteUrl}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Type: {audit.websiteType}</span>
                    <span>Market: {audit.targetMarket}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 ml-4">
                  {formatDate(audit.generatedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <ProtectedFeature
      featureName="Audit History"
      description="Save and access your previous CRO audit results"
    >
      {content}
    </ProtectedFeature>
  );
}