import { AuditResult } from '../types/audit';
import { OpenAIClient } from './openaiClient';

// Fallback data for when API is not available
const generateFallbackAudit = async (
  websiteUrl: string,
  websiteType: string,
  targetMarket: string,
  mode: string,
  onProgress: (message: string) => void
): Promise<AuditResult> => {
  const isAdvanced = mode === 'Advanced';
  
  // Simulate progressive analysis
  onProgress('Analyzing homepage structure...');
  await new Promise(resolve => setTimeout(resolve, 800));
  
  onProgress('Evaluating navigation and user flow...');
  await new Promise(resolve => setTimeout(resolve, 600));
  
  onProgress('Reviewing conversion funnels...');
  await new Promise(resolve => setTimeout(resolve, 700));
  
  onProgress('Assessing mobile experience...');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  onProgress('Generating recommendations...');
  await new Promise(resolve => setTimeout(resolve, 400));

  // Return basic fallback audit
  return {
    id: Date.now().toString(),
    websiteUrl,
    websiteType,
    targetMarket,
    mode,
    recommendations: [
      {
        id: 'fallback-1',
        observation: 'API key not configured - showing demo recommendations',
        strengths: 'Clean website structure',
        suggestedImprovement: 'Configure your OpenAI API key to get real, personalized audit recommendations',
        impact: 'High',
        effort: 'Low',
        section: 'Homepage',
        pageType: 'Homepage'
      }
    ],
    quickWins: [
      {
        id: 'qw-fallback-1',
        change: 'Configure OpenAI API key for real recommendations',
        cost: 'Free (requires API key)',
        impact: 'High',
        priority: 'High'
      }
    ],
    abTests: [
      {
        id: 'ab-fallback-1',
        testName: 'API Integration Test',
        frictionPoint: 'Missing personalized recommendations',
        expectedLift: '100% improvement in audit quality',
        description: 'Add your OpenAI API key to get real, contextual CRO recommendations'
      }
    ],
    introduction: `# Demo Mode - Configure API Key for Real Audits

This is a demonstration of the CRO Audit Tool. To get real, personalized recommendations for **${websiteUrl}**, please configure your OpenAI API key using the settings button in the header.

With a valid API key, you'll receive:
- 15-25 specific, actionable recommendations
- 8-12 quick wins with cost estimates  
- 4-6 A/B test ideas with expected lift
- Analysis tailored to your ${websiteType.toLowerCase()} website and ${targetMarket} market

The audit will cover navigation, homepage optimization, mobile experience, trust signals, and psychological persuasion principles.`,
    generatedAt: Date.now()
  };
};

export const generateAudit = async (
  websiteUrl: string,
  websiteType: string,
  targetMarket: string,
  mode: string,
  onProgress: (message: string) => void,
  apiKey?: string
): Promise<AuditResult> => {
  if (!apiKey) {
    return generateFallbackAudit(websiteUrl, websiteType, targetMarket, mode, onProgress);
  }

  try {
    const client = new OpenAIClient(apiKey);
    return await client.generateAudit(websiteUrl, websiteType, targetMarket, mode, onProgress);
  } catch (error) {
    console.error('Failed to generate audit with OpenAI:', error);
    throw error;
  }
};