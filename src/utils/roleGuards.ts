
// Centralized helper functions for role and auth guards

import { getCurrentSecurityContext } from '@/utils/authorizationUtils';

export async function requireRole(required: 'admin' | 'service_provider'): Promise<boolean> {
  const context = await getCurrentSecurityContext();
  if (!context) return false;
  if (required === 'admin') return context.role === 'admin';
  if (required === 'service_provider') return context.role === 'service_provider' || context.role === 'admin';
  return false;
}

export function hasAnyRole(role: string, allowed: string[]): boolean {
  return allowed.includes(role);
}
