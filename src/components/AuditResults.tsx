import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import { FileText, Home, ShoppingBag, FormInput, Zap, FlaskConical } from 'lucide-react';
import { AuditResult, FilterState, AuditRecommendation } from '../types/audit';
import { FilterControls } from './FilterControls';
import { RecommendationsTable } from './RecommendationsTable';
import { QuickWinsTable } from './QuickWinsTable';
import { ABTestsTable } from './ABTestsTable';
import { AccordionSection } from './AccordionSection';

interface AuditResultsProps {
  result: AuditResult;
}

export const AuditResults: React.FC<AuditResultsProps> = ({ result }) => {
  const [filters, setFilters] = useState<FilterState>({
    impact: 'All',
    effort: 'All',
    section: 'All'
  });
  
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

  const pageTypes = useMemo(() => {
    const types = Array.from(new Set(result.recommendations.map(r => r.pageType)));
    return types;
  }, [result.recommendations]);

  const availableSections = useMemo(() => {
    return Array.from(new Set(result.recommendations.map(r => r.section)));
  }, [result.recommendations]);

  const filteredRecommendationsByPage = useMemo(() => {
    const filtered: Record<string, AuditRecommendation[]> = {};
    
    pageTypes.forEach(pageType => {
      filtered[pageType] = result.recommendations.filter(rec => {
        if (rec.pageType !== pageType) return false;
        if (filters.impact !== 'All' && rec.impact !== filters.impact) return false;
        if (filters.effort !== 'All' && rec.effort !== filters.effort) return false;
        if (filters.section !== 'All' && rec.section !== filters.section) return false;
        return true;
      });
    });
    
    return filtered;
  }, [result.recommendations, filters, pageTypes]);

  const getVisibleCount = (pageType: string) => {
    return visibleCounts[pageType] || 10;
  };

  const loadMore = (pageType: string) => {
    setVisibleCounts(prev => ({
      ...prev,
      [pageType]: (prev[pageType] || 10) + 10
    }));
  };

  const getPageIcon = (pageType: string) => {
    switch (pageType.toLowerCase()) {
      case 'homepage': return <Home className="h-5 w-5 text-blue-600" />;
      case 'category pages': 
      case 'product pages': return <ShoppingBag className="h-5 w-5 text-green-600" />;
      case 'landing pages':
      case 'form pages': return <FormInput className="h-5 w-5 text-purple-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const introductionHtml = useMemo(() => {
    return marked(result.introduction);
  }, [result.introduction]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Introduction */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: introductionHtml }}
        />
      </div>

      {/* Cache notification */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          ✅ Results saved for your session (expires in 24 hours)
        </p>
      </div>

      {/* Filter Controls */}
      <FilterControls
        filters={filters}
        onFilterChange={setFilters}
        availableSections={availableSections}
      />

      {/* Recommendations by Page Type */}
      <div className="space-y-6">
        {pageTypes.map((pageType) => {
          const recommendations = filteredRecommendationsByPage[pageType];
          const visibleCount = getVisibleCount(pageType);
          const hasMore = visibleCount < recommendations.length;

          return (
            <AccordionSection
              key={pageType}
              title={`${pageType} (${recommendations.length} recommendations)`}
              icon={getPageIcon(pageType)}
              defaultOpen={pageType === 'Homepage'}
            >
              <RecommendationsTable
                recommendations={recommendations}
                visibleCount={visibleCount}
                onLoadMore={() => loadMore(pageType)}
                hasMore={hasMore}
                pageType={pageType}
              />
            </AccordionSection>
          );
        })}
      </div>

      {/* Quick Wins */}
      <AccordionSection
        title={`Quick Wins (${result.quickWins.length} items)`}
        icon={<Zap className="h-5 w-5 text-green-600" />}
        defaultOpen
      >
        <QuickWinsTable quickWins={result.quickWins} />
      </AccordionSection>

      {/* A/B Tests */}
      <AccordionSection 
        title={`A/B Test Ideas (${result.abTests.length} tests)`}
        icon={<FlaskConical className="h-5 w-5 text-purple-600" />}
        defaultOpen
      >
        <ABTestsTable abTests={result.abTests} />
      </AccordionSection>
    </div>
  );
};