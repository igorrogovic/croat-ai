import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import { FileText, Home, ShoppingBag, FormInput, Zap, FlaskConical, LayoutTemplate, Palette, Loader2, Brain, Download } from 'lucide-react';
import { AuditResult, FilterState, AuditRecommendation } from '../types/audit';
import { FilterControls } from './FilterControls';
import { RecommendationsTable } from './RecommendationsTable';
import { QuickWinsTable } from './QuickWinsTable';
import { AccordionSection } from './AccordionSection';
import { HeuristicAnalysis } from './HeuristicAnalysis/HeuristicAnalysis';
import { generateMockup } from '../utils/auditGenerator';
import { PXLTestTable } from './PXL/PXLTestTable';
import { Target, ListChecks } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { getUserApiKey } from '../utils/userStorage';

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
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [generatedMockup, setGeneratedMockup] = useState<string | null>(result.mockDesign || null);
  const { user } = useUser();

  const handleGenerateDesign = async () => {
      setIsGeneratingDesign(true);
      try {
          const apiKey = user ? getUserApiKey(user.id) : localStorage.getItem('openai_api_key');
          const mockup = await generateMockup(result, (msg) => console.log(msg), apiKey || undefined);
          setGeneratedMockup(mockup);
      } catch (e) {
          console.error(e);
          alert("Failed to generate design");
      } finally {
          setIsGeneratingDesign(false);
      }
  };

  const handleDownloadCode = () => {
    if (!generatedMockup) return;

    const blob = new Blob([generatedMockup], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cro-mockup.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
    if (!pageType) return <FileText className="h-5 w-5 text-gray-600" />;

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
    // @ts-ignore
    return marked.parse ? marked.parse(result.introduction) : marked(result.introduction);
  }, [result.introduction]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Introduction */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: introductionHtml as string }}
        />
      </div>

       {/* Heuristic Analysis Section */}
       {result.heuristicAnalysis && result.heuristicAnalysis.length > 0 && (
         <AccordionSection
            title="Expert Heuristic Analysis (7 Pillars)"
            icon={<Brain className="h-5 w-5 text-purple-600" />}
            defaultOpen
         >
             <HeuristicAnalysis categories={result.heuristicAnalysis} />
         </AccordionSection>
       )}

      {/* Mock Design Section */}
      <AccordionSection
            title="AI Generated Design Mockup"
            icon={<LayoutTemplate className="h-5 w-5 text-indigo-600" />}
            defaultOpen
        >
            <div className="bg-slate-900 rounded-lg p-6 overflow-hidden">
                {!generatedMockup ? (
                    <div className="text-center py-12">
                         <div className="mb-6">
                            <Palette className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Generate High-Fidelity Mockup</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                The AI Team can visualize these recommendations into a premium HTML mockup.
                                This process takes about 30-45 seconds.
                            </p>
                         </div>
                         <button
                            onClick={handleGenerateDesign}
                            disabled={isGeneratingDesign}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                         >
                            {isGeneratingDesign ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Designing UX...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Generate AI Design
                                </>
                            )}
                         </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-white text-sm opacity-80">
                                based on the granular heuristic analysis by the CRO Team.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDownloadCode}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded border border-slate-700 flex items-center"
                                    title="Download Human-Readable Code"
                                >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download Code
                                </button>
                                <button
                                    onClick={handleGenerateDesign}
                                    disabled={isGeneratingDesign}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded border border-slate-700"
                                >
                                    Regenerate
                                </button>
                            </div>
                        </div>
                        <div className="w-full h-[800px] bg-slate-950 rounded-md overflow-hidden border border-slate-700 relative">
                             {isGeneratingDesign && (
                                 <div className="absolute inset-0 bg-slate-900/80 z-20 flex items-center justify-center">
                                     <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                 </div>
                             )}
                            <iframe
                                srcDoc={generatedMockup}
                                title="Design Mockup"
                                className="w-full h-full border-0"
                                sandbox="allow-scripts"
                            />
                        </div>
                    </>
                )}
            </div>
        </AccordionSection>

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

      {/* PXL Tests */}
      {result.pxlTests && result.pxlTests.length > 0 && (
        <AccordionSection
          title={`PXL Prioritized Landing Page Tests (${result.pxlTests.length})`}
          icon={<Target className="h-5 w-5 text-indigo-500" />}
          defaultOpen
        >
          <PXLTestTable tests={result.pxlTests} />
        </AccordionSection>
      )}
    </div>
  );
};