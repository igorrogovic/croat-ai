import { AuditResult, AuditRecommendation, QuickWin, ABTest } from '../types/audit';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class OpenAIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(messages: Array<{ role: string; content: string }>): Promise<string> {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key and try again.');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again in a few minutes.');
      } else if (response.status === 403) {
        throw new Error('API access forbidden. Please check your OpenAI account status and billing.');
      }
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private createSystemPrompt(websiteType: string, mode: string): string {
    const tone = mode === 'Advanced' ? 'technical and detailed' : 'approachable and educational';
    
    return `You are a senior CRO (Conversion Rate Optimization) consultant with 10+ years of experience auditing ${websiteType.toLowerCase()} websites. Your task is to generate a comprehensive audit with specific, actionable recommendations.

TONE: Use a ${tone} tone. ${mode === 'Advanced' ? 'Include specific metrics, technical implementations, and industry benchmarks.' : 'Explain technical terms and provide clear, easy-to-understand guidance.'}

RESPONSE FORMAT: You must respond with valid JSON only, no additional text. The JSON should have this exact structure:

{
  "introduction": "markdown string (200-300 words)",
  "recommendations": [
    {
      "id": "unique-id",
      "observation": "specific issue found",
      "strengths": "positive aspects noted",
      "suggestedImprovement": "actionable fix with specific details",
      "impact": "High|Medium|Low",
      "effort": "High|Medium|Low", 
      "section": "Navigation|Homepage|Product Pages|Category Pages|Landing Pages|Form Pages|Mobile Experience|Copywriting|Tech & Load Time|Trust Signals|Psychological Persuasion",
      "pageType": "Homepage|Category Pages|Product Pages|Landing Pages|Form Pages"
    }
  ],
  "quickWins": [
    {
      "id": "unique-id",
      "change": "specific change description",
      "effort": "High|Medium|Low",
      "impact": "High|Medium|Low",
      "priority": "High|Medium|Low"
    }
  ],
  "abTests": [
    {
      "id": "unique-id",
      "testName": "descriptive test name",
      "frictionPoint": "specific problem being addressed",
      "expectedLift": "percentage improvement estimate",
      "description": "detailed test description"
    }
  ]
}

REQUIREMENTS:
- Generate 15-25 recommendations covering all major sections
- Include 8-12 quick wins with effort estimates (High/Medium/Low)
- Provide 4-6 A/B test ideas with expected lift percentages
- Focus on conversion optimization, not SEO
- Use specific UI/UX details (button sizes, colors, positioning)
- Reference established UX principles and psychological triggers
- Ensure all recommendations are actionable and specific`;
  }

  private createUserPrompt(websiteUrl: string, websiteType: string, targetMarket: string): string {
    const pageTypes = websiteType === 'E-commerce' 
      ? 'Homepage, Category Pages, Product Pages'
      : 'Homepage, Landing Pages, Form Pages';

    return `Analyze this ${websiteType.toLowerCase()} website: ${websiteUrl}

Target Market: ${targetMarket}
Page Types to Focus On: ${pageTypes}

Please provide a comprehensive CRO audit covering:

1. **Navigation & Site Structure**: Menu organization, search functionality, breadcrumbs
2. **${websiteType === 'E-commerce' ? 'Homepage & Category Pages' : 'Homepage & Landing Pages'}**: Value proposition, hero sections, content hierarchy
3. **${websiteType === 'E-commerce' ? 'Product Pages' : 'Form Pages'}**: ${websiteType === 'E-commerce' ? 'Product presentation, add-to-cart optimization, reviews' : 'Form design, field optimization, conversion flow'}
4. **Mobile Experience**: Responsive design, touch targets, mobile-specific optimizations
5. **Trust Signals**: Security badges, testimonials, social proof, credibility indicators
6. **Psychological Persuasion**: Scarcity, urgency, social proof, authority principles
7. **Technical Performance**: Load times, Core Web Vitals, technical barriers
8. **Copywriting**: Headlines, CTAs, benefit communication

Focus on realistic, implementable improvements with specific design and technical details.`;
  }

  async generateAudit(
    websiteUrl: string,
    websiteType: string,
    targetMarket: string,
    mode: string,
    onProgress: (message: string) => void
  ): Promise<AuditResult> {
    onProgress('Connecting to OpenAI...');
    
    const systemPrompt = this.createSystemPrompt(websiteType, mode);
    const userPrompt = this.createUserPrompt(websiteUrl, websiteType, targetMarket);

    onProgress('Analyzing website structure...');
    
    try {
      const response = await this.makeRequest([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      onProgress('Processing recommendations...');

      // Parse the JSON response
      let parsedResponse;
      try {
        // Clean the response in case there's any extra text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', response);
        throw new Error('Failed to parse audit results. Please try again.');
      }

      onProgress('Finalizing audit...');

      // Normalize helpers to ensure consistent values
      const normalizeHML = (value: unknown): 'High' | 'Medium' | 'Low' => {
        const v = String(value || '').toLowerCase();
        if (v.startsWith('h')) return 'High';
        if (v.startsWith('l')) return 'Low';
        if (v.startsWith('m')) return 'Medium';
        return 'Medium';
      };
      const deriveEffortFromCost = (cost: unknown): 'High' | 'Medium' | 'Low' => {
        const c = String(cost || '').toLowerCase();
        if (!c) return 'Medium';
        if (/free|low|minor|quick|simple|<\$?100|under\s*\$?100/.test(c)) return 'Low';
        if (/medium|~|\$?100-?\$?1000|\$?1\d\d|\$?\d{2,3}/.test(c)) return 'Medium';
        if (/high|significant|substantial|>\$?1000|\$?\d{4,}/.test(c)) return 'High';
        return 'Medium';
      };
      const normalizedQuickWins = (parsedResponse.quickWins || []).map((qw: any) => ({
        id: qw.id,
        change: qw.change,
        impact: normalizeHML(qw.impact),
        effort: qw.effort ? normalizeHML(qw.effort) : deriveEffortFromCost(qw.cost),
        priority: normalizeHML(qw.priority),
      }));

      // Validate and structure the response
      const auditResult: AuditResult = {
        id: Date.now().toString(),
        websiteUrl,
        websiteType,
        targetMarket,
        mode,
        recommendations: parsedResponse.recommendations || [],
        quickWins: normalizedQuickWins,
        abTests: parsedResponse.abTests || [],
        introduction: parsedResponse.introduction || 'Audit completed successfully.',
        generatedAt: Date.now()
      };

      // Validate that we have reasonable data
      if (auditResult.recommendations.length === 0) {
        throw new Error('No recommendations were generated. Please try again.');
      }

      return auditResult;

      // Validate that we have reasonable data
      if (auditResult.recommendations.length === 0) {
        throw new Error('No recommendations were generated. Please try again.');
      }

      return auditResult;

    } catch (error) {
      console.error('OpenAI API Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate audit. Please check your API key and try again.');
    }
  }
}