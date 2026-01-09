import { AuditResult } from '../types/audit';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const DESIGN_CSS = `
:root { --primary: #00A3E0; --secondary: #00D2BE; --dark-bg: #0F172A; --card-bg: rgba(255, 255, 255, 0.05); --border: rgba(255, 255, 255, 0.1); --text-main: #F1F5F9; --text-muted: #94A3B8; }
body { font-family: 'Inter', sans-serif; background-color: var(--dark-bg); color: var(--text-main); line-height: 1.6; margin: 0; background-image: radial-gradient(circle at 50% 0%, rgba(0, 163, 224, 0.1) 0%, transparent 60%); }
.container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
section { padding: 80px 0; border-bottom: 1px solid var(--border); }
h1, h2, h3 { font-family: 'Outfit', sans-serif; color: #fff; }
.framework-note { background: rgba(255, 243, 205, 0.1); border: 1px dashed #FFC107; color: #FFC107; padding: 8px 12px; font-size: 0.8rem; border-radius: 4px; margin-bottom: 16px; display: inline-block; }
.btn { display: inline-block; padding: 16px 32px; border-radius: 50px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white; text-decoration: none; font-weight: 600; transition: transform 0.2s; border: none; cursor: pointer; }
.btn:hover { transform: translateY(-2px); }
.card { background: var(--card-bg); border: 1px solid var(--border); padding: 30px; border-radius: 12px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.stat { font-size: 2.5rem; font-weight: 800; color: var(--secondary); }
`;

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
        response_format: { type: "json_object" }
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

  private createSystemPrompt(websiteType: string): string {
    return `You are an elite CRO Agency Team comprising: Strategist, Psychologist, UX Designer, and Copywriter.

Your task is to conduct a **Comprehensive Team Audit** of a ${websiteType} website.

**STEP 1: DETAILED HEURISTIC ANALYSIS (7 Pillars)**
Evaluate the side on strictly these pillars:
1. Orient Upon Entrance (H1, Message Match)
2. Minimize Distraction (Layout, Links)
3. Value Proposition (Why Us?)
4. Reduce Anxiety (Trust, Proof)
5. Make it Easy (UX, CTA)
6. Pricing & Offer
7. Copywriting

**STEP 2: ACTIONABLE RECOMMENDATIONS**
Generate specific, prioritized recommendations based on the analysis.

RESPONSE FORMAT: You must respond with valid JSON only. Structure:
{
  "introduction": "markdown (Executive summary)",
  "heuristicAnalysis": [
      {
          "category": "1. Orient Upon Entrance",
          "items": [
              { "question": "Does H1 explain WHAT it is?", "score": 3, "observation": "...", "recommendation": "..." },
              { "question": "Is the audience clear?", "score": 1, "observation": "...", "recommendation": "..." }
          ]
      },
      {
          "category": "2. Minimize Distraction",
          "items": [
              { "question": "...", "score": 0, "observation": "...", "recommendation": "..." }
          ]
      },
      {
          "category": "3. Value Proposition",
          "items": [
              { "question": "...", "score": 0, "observation": "...", "recommendation": "..." }
          ]
      },
      {
          "category": "4. Reduce Anxiety",
          "items": [
              { "question": "...", "score": 0, "observation": "...", "recommendation": "..." }
          ]
      },
      {
          "category": "5. Make it Easy",
          "items": [
              { "question": "...", "score": 0, "observation": "...", "recommendation": "..." }
          ]
      },
      {
          "category": "6. Pricing & Offer",
          "items": [
              { "question": "...", "score": 0, "observation": "...", "recommendation": "..." }
          ]
      },
      {
          "category": "7. Copywriting",
          "items": [
              { "question": "...", "score": 0, "observation": "...", "recommendation": "..." }
          ]
      }
  ],
  "recommendations": [
      {
          "id": "rec_1",
          "pageType": "Homepage",
          "section": "Hero",
          "observation": "Current headline is vague and doesn't state the USP.",
          "strengths": "Good contrast on the CTA button.",
          "suggestedImprovement": "Rewrite H1 to focus on benefit X using the 'How to [Benefit] without [Pain]' formula.",
          "impact": "High",
          "effort": "Low",
          "priority": "High"
      }
  ],
  "quickWins": [
      {
          "id": "qw_1",
          "change": "Change CTA color to...",
          "impact": "Medium",
          "effort": "Low",
          "priority": "High"
      }
  ],
  "abTests": [
      {
          "id": "test_1",
          "hypothesis": "Changing the headline will...",
          "variantA": "Current Headline",
          "variantB": "Proposed Headline"
      }
  ],
  "pxlTests": [
      {
          "id": "pxl_1",
          "title": "Hero Video Background",
          "hypothesis": "Replacing static hero with video will increase engagement by demonstrating value immediately.",
          "isAboveFold": true,
          "isNoticeableIn5Sec": true,
          "addsOrRemoves": true,
          "highTraffic": true,
          "addressedIssue": true,
          "easeOfImplementation": "Medium",
          "score": 0
      },
      {
          "id": "pxl_2",
          "title": "CTA Button Color & Copy Test",
          "hypothesis": "Changing CTA button from blue to high-contrast color with action-oriented copy will increase click-through rate by 15%.",
          "isAboveFold": true,
          "isNoticeableIn5Sec": true,
          "addsOrRemoves": false,
          "highTraffic": true,
          "addressedIssue": true,
          "easeOfImplementation": "Low",
          "score": 0
      },
      {
          "id": "pxl_3",
          "title": "Social Proof Section Placement",
          "hypothesis": "Moving testimonials and trust badges above the fold will increase conversion rate by reducing friction and building credibility earlier.",
          "isAboveFold": true,
          "isNoticeableIn5Sec": true,
          "addsOrRemoves": true,
          "highTraffic": true,
          "addressedIssue": true,
          "easeOfImplementation": "Medium",
          "score": 0
      },
      {
          "id": "pxl_4",
          "title": "Form Field Reduction",
          "hypothesis": "Reducing lead capture form from 5 fields to 3 (email, name, company) will increase form submission rate by 25%.",
          "isAboveFolk": false,
          "isNoticeableIn5Sec": false,
          "addsOrRemoves": false,
          "highTraffic": true,
          "addressedIssue": true,
          "easeOfImplementation": "Low",
          "score": 0
      }
  ]
}

IMPORTANT:
- Populate "heuristicAnalysis" with at least 2-3 specific questions/checks per category.
- "score" is 0-3 (3 is best).
- Be extremely specific in "observation" and "recommendation".
- Ensure "recommendations" array is populated with explicitly valid "impact", "effort", "priority" (High/Medium/Low).
- CRITICAL: For each "recommendations" item, you MUST populate "observation", "strengths", and "suggestedImprovement". The "pageType" "Homepage" is the most important one.
- POPULATE "pxlTests" with 3-4 High-Impact Landing Page test ideas.
`;
  }

  private createDesignPrompt(websiteType: string, analysis: any): string {
      return `You are an expert AI Web Designer.

      CONTEXT:
      We have analyzed a ${websiteType} website.
      Summary of strategy: ${analysis.introduction || "Focus on conversion."}

      TASK:
      Create a High-Fidelity HTML Mockup of the COMPLETE NEW Homepage based on the analysis.

      DESIGN SYSTEM (CSS is already injected, use these classes):
      - .container, .btn, .card, .grid-2, .grid-3, .framework-note, .stat
      - Dark Mode Theme (Backgrounds are dark, Text is light/white)

      REQUIREMENTS:
      - Return ONLY the HTML <body> content. Do not include <html>, <head> or <style> tags.
      - Use <div class="framework-note">...</div> to annotate specific design decisions (e.g. "Audit Fix #12: Clarified Value Prop")

      STRUCTURE TO FOLLOW (Based on Best Practices):

      SECTION 1: HERO & OFFER
      - <section style="text-align: center; padding-top: 120px;">
      - .container
      - .framework-note (explaining the headline change)
      - Main Headline (h1) - Clear, benefit-driven.
      - Subheadline (p) - Addressing pain points.
      - PROMINENT CTA (.btn)

      SECTION 2: WHY CHOOSE US (Proof & Value)
      - <section>
      - .container
      - h2 Title
      - .grid-3
      - 3 x .card
          - .stat (e.g. "5x", "30%")
          - h3 Benefit
          - p Description

      SECTION 3: SOCIAL PROOF / TESTIMONIAL
      - <section>
      - .container
      - .grid-2 (align-items: center)
      - Left: Big Testimonial Quote (h2) + Author Name/Title
      - Right: Video Placeholder or Image (.card aspect-ratio 16/9)

      SECTION 4: LEAD CAPTURE / FINAL CTA
      - <section style="text-align: center;">
      - .container
      - h2 "Ready to [Benefit]?"
      - .card (max-width: 450px; margin: 0 auto; text-align: left;)
          - h3 Form Header
          - Form inputs (email)
          - Button (.btn width: 100%)
          - "No credit card required" microcopy

      OUTPUT FORMAT:
      JSON: { "html": "<div>...</div>" }
      `;
  }

  async generateAudit(
    websiteUrl: string,
    websiteType: string,
    targetMarket: string,
    mode: string,
    onProgress: (message: string) => void,
    websiteContent: string = ""
  ): Promise<AuditResult> {
    onProgress('Assembling CRO Expert Team...');

    const systemPrompt = this.createSystemPrompt(websiteType);
    let userPrompt = `Analyze this ${websiteType} website: ${websiteUrl}\nTarget Market: ${targetMarket}`;

    if (websiteContent) {
        userPrompt += `\n\nWEBSITE ACTUAL TEXT CONTENT (Use this for deep analysis):\n"""\n${websiteContent}\n"""\n\nPlease base your heuristic analysis on this actual content. Cite specific headlines, button text, and copy from the content provided.`;
    } else {
        userPrompt += `\n\nNote: Live content could not be fetched. Please infer the analysis based on standard patterns for this industry and URL structure.`;
    }


    onProgress('Conducting expert heuristic analysis...');
    
    try {
      const response = await this.makeRequest([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);
      
      let parsedResponse;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', response);
        throw new Error('Failed to parse audit results.');
      }

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
        generatedAt: Date.now(),
        heuristicAnalysis: parsedResponse.heuristicAnalysis || [],
        pxlTests: parsedResponse.pxlTests || []
      };

      return auditResult;
    } catch (error) {
      console.error('Failed to generate audit with OpenAI:', error);
      throw error;
    }
  }

  async generateMockup(
      auditResult: AuditResult,
      onProgress: (message: string) => void
  ): Promise<string> {
      onProgress('UX Designer is creating high-fidelity mockups...');
      
      const designPrompt = this.createDesignPrompt(auditResult.websiteType, auditResult);
      
      try {
          const response = await this.makeRequest([
              { role: 'system', content: "You are an expert Frontend Developer and UX Designer." },
              { role: 'user', content: designPrompt }
          ]);
          
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : response;
          const parsed = JSON.parse(jsonString);
          
          // Wrap with the full HTML shell here to ensure consistency
          return `<!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>${DESIGN_CSS}</style>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
          </head>
          <body>
              ${parsed.html}
          </body>
          </html>`;
          
      } catch (error) {
          console.error("Failed to generate design", error);
          throw new Error("Failed to generate design mockup.");
      }
  }
}
