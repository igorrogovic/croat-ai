export const validateUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateTargetMarket = (market: string): boolean => {
  if (!market || market.length === 0 || market.length > 50) return false;
  return /^[a-zA-Z0-9\s\-,]+$/.test(market);
};

export const validateWebsiteType = (type: string): boolean => {
  return ['E-commerce', 'Lead Generation'].includes(type);
};