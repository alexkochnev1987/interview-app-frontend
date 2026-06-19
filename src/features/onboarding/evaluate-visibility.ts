import {
  canConfigureInterview,
  canManageTeam,
  canReadQuestions,
  canReviewAssessments,
} from '@/lib/auth-roles';

import type {
  OnboardingRuntimeContext,
  OnboardingStepConfig,
  OnboardingVisibilityRule,
} from '@/features/onboarding/types';

function evaluateVisibilityRule(
  rule: OnboardingVisibilityRule,
  context: OnboardingRuntimeContext,
): boolean {
  switch (rule.type) {
    case 'anyRole':
      return rule.roles.includes(context.role ?? '');
    case 'permission':
      return context.permissions?.includes(rule.permission) ?? false;
    case 'featureFlag':
      return context.featureFlags?.[rule.flag] === true;
    case 'canManageTeam':
      return canManageTeam(context.role);
    case 'canReadQuestions':
      return canReadQuestions(context.role);
    case 'canReviewAssessments':
      return canReviewAssessments(context.role);
    case 'canConfigureInterview':
      return canConfigureInterview(context.role);
    default:
      return true;
  }
}

export function isOnboardingStepVisible(
  step: OnboardingStepConfig,
  context: OnboardingRuntimeContext,
): boolean {
  const rules = step.visibility;
  if (!rules || rules.length === 0) {
    return true;
  }

  return rules.every((rule) => evaluateVisibilityRule(rule, context));
}
