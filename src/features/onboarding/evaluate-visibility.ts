import {
  canConfigureInterview,
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
    case 'notDemo':
      return context.isDemo !== true;
    case 'canReadQuestions':
      return canReadQuestions(context.role);
    case 'canReviewAssessments':
      return canReviewAssessments(context.role);
    case 'canConfigureInterview':
      return canConfigureInterview(context.role);
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
