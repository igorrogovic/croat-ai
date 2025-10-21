import { AuditResult } from '../types/audit';

const STORAGE_KEY = 'cro_audit_results';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Normalize label to 'High' | 'Medium' | 'Low'
function normalizeHML(value: unknown): 'High' | 'Medium' | 'Low' {
  const v = String(value || '').toLowerCase();
  if (v.startsWith('h')) return 'High';
  if (v.startsWith('l')) return 'Low';
  if (v.startsWith('m')) return 'Medium';
  return 'Medium';
}

// Derive effort from legacy `cost` strings when present
function deriveEffortFromCost(cost: unknown): 'High' | 'Medium' | 'Low' {
  const c = String(cost || '').toLowerCase();
  if (!c) return 'Medium';
  if (/free|low|minor|quick|simple|<\$?100|under\s*\$?100/.test(c)) return 'Low';
  if (/medium|~|\$?100-?\$?1000|\$?1\d\d|\$?\d{2,3}/.test(c)) return 'Medium';
  if (/high|significant|substantial|>\$?1000|\$?\d{4,}/.test(c)) return 'High';
  return 'Medium';
}

function normalizeAuditResult(result: AuditResult): AuditResult {
  const normalizedQuickWins = (result.quickWins || []).map((qw: any) => {
    const effort = qw.effort
      ? normalizeHML(qw.effort)
      : deriveEffortFromCost(qw.cost);

    return {
      id: qw.id,
      change: qw.change,
      impact: normalizeHML(qw.impact),
      effort,
      priority: normalizeHML(qw.priority),
    };
  });

  return { ...result, quickWins: normalizedQuickWins };
}

export const saveAuditResult = (result: AuditResult): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const results = stored ? JSON.parse(stored) : [];

    // Normalize before saving to keep schema consistent
    const toSave = normalizeAuditResult(result);

    // Remove old results for the same URL
    const filteredResults = results.filter((r: AuditResult) => r.websiteUrl !== toSave.websiteUrl);

    // Add new result
    filteredResults.push(toSave);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredResults));
  } catch (error) {
    console.warn('Failed to save audit result to localStorage:', error);
  }
};

export const loadAuditResult = (websiteUrl: string): AuditResult | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const results: AuditResult[] = JSON.parse(stored);
    const result = results.find(r => r.websiteUrl === websiteUrl);

    if (!result) return null;

    // Check if result is still valid (within cache duration)
    const isExpired = Date.now() - result.generatedAt > CACHE_DURATION;
    if (isExpired) {
      // Remove expired result
      const filteredResults = results.filter(r => r.websiteUrl !== websiteUrl);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredResults));
      return null;
    }

    // Normalize legacy data on load
    return normalizeAuditResult(result);
  } catch (error) {
    console.warn('Failed to load audit result from localStorage:', error);
    return null;
  }
};

export const clearExpiredResults = (): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const results: AuditResult[] = JSON.parse(stored);
    const validResults = results.filter(r => Date.now() - r.generatedAt <= CACHE_DURATION);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(validResults));
  } catch (error) {
    console.warn('Failed to clear expired results:', error);
  }
};