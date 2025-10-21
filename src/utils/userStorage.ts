import { AuditResult } from '../types/audit';

// User-specific storage utilities
export function getUserStorageKey(userId: string, key: string): string {
  return `user_${userId}_${key}`;
}

export function saveUserAuditResult(userId: string, result: AuditResult): void {
  try {
    const userAudits = getUserAuditResults(userId);
    const updatedAudits = [result, ...userAudits.slice(0, 9)]; // Keep last 10 audits
    
    localStorage.setItem(
      getUserStorageKey(userId, 'audit_results'),
      JSON.stringify(updatedAudits)
    );
  } catch (error) {
    console.error('Failed to save user audit result:', error);
  }
}

export function getUserAuditResults(userId: string): AuditResult[] {
  try {
    const stored = localStorage.getItem(getUserStorageKey(userId, 'audit_results'));
    if (!stored) return [];
    
    const results = JSON.parse(stored) as AuditResult[];
    // Filter out expired results (older than 7 days)
    const validResults = results.filter(result => {
      const resultDate = new Date(result.generatedAt);
      const now = new Date();
      const daysDiff = (now.getTime() - resultDate.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7;
    });
    
    // Update storage if we filtered out expired results
    if (validResults.length !== results.length) {
      localStorage.setItem(
        getUserStorageKey(userId, 'audit_results'),
        JSON.stringify(validResults)
      );
    }
    
    return validResults;
  } catch (error) {
    console.error('Failed to load user audit results:', error);
    return [];
  }
}

export function clearUserAuditResults(userId: string): void {
  try {
    localStorage.removeItem(getUserStorageKey(userId, 'audit_results'));
  } catch (error) {
    console.error('Failed to clear user audit results:', error);
  }
}

export function saveUserApiKey(userId: string, apiKey: string): void {
  try {
    localStorage.setItem(getUserStorageKey(userId, 'openai_api_key'), apiKey);
  } catch (error) {
    console.error('Failed to save user API key:', error);
  }
}

export function getUserApiKey(userId: string): string | null {
  try {
    return localStorage.getItem(getUserStorageKey(userId, 'openai_api_key'));
  } catch (error) {
    console.error('Failed to load user API key:', error);
    return null;
  }
}