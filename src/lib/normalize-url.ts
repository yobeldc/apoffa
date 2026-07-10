// src/lib/normalize-url.ts
// URL normalization utilities

export function normalizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Remove trailing slash
    let normalized = parsed.origin + parsed.pathname.replace(/\/$/, '') + parsed.search;
    
    // Remove common tracking parameters
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'ref',
    ];
    
    const urlObj = new URL(normalized);
    trackingParams.forEach((param) => urlObj.searchParams.delete(param));
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

export function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
