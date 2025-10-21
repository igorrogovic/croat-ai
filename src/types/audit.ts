export interface AuditRecommendation {
  id: string;
  observation: string;
  strengths: string;
  suggestedImprovement: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  section: string;
  pageType: string;
}

export interface QuickWin {
  id: string;
  change: string;
  effort: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  priority: 'High' | 'Medium' | 'Low';
}

export interface ABTest {
  id: string;
  testName: string;
  frictionPoint: string;
  expectedLift: string;
  description: string;
}

export interface AuditResult {
  id: string;
  websiteUrl: string;
  websiteType: string;
  targetMarket: string;
  mode: string;
  recommendations: AuditRecommendation[];
  quickWins: QuickWin[];
  abTests: ABTest[];
  introduction: string;
  generatedAt: number;
}

export interface FilterState {
  impact: string;
  effort: string;
  section: string;
}