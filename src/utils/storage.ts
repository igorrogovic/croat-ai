import { AuditResult } from '../types/audit';

const STORAGE_KEY = 'cro_audit_results';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const saveAuditResult = (result: AuditResult): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const results = stored ? JSON.parse(stored) : [];
    
    // Remove old results for the same URL
    const filteredResults = results.filter((r: AuditResult) => r.websiteUrl !== result.websiteUrl);
    
    // Add new result
    filteredResults.push(result);
    
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
    
    return result;
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