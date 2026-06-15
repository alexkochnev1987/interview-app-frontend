import type { AuthUserResponseDto } from '@/lib/api';
import { canAccessDashboard } from '@/lib/auth-roles';

export function isOnboardingPending(
  user: AuthUserResponseDto | null | undefined,
): boolean {
  if (!user) return false;
  return user.onboardingCompletedAt == null;
}

export function shouldOfferOnboarding(
  user: AuthUserResponseDto | null | undefined,
): boolean {
  if (!user) return false;
  if (!canAccessDashboard(user.role)) return false;
  return isOnboardingPending(user);
}
