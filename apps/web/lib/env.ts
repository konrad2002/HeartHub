/**
 * Get the API base URL from runtime environment
 * Reads from window.__ENV__ (runtime) first, then falls back to process.env (build time)
 */
export function getApiBaseUrl(): string {
  // Client-side: check for runtime-injected environment
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  }

  // Server-side or build-time fallback
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
}
