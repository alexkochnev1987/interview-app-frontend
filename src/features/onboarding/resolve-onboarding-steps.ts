import { isOnboardingRoute } from '@/features/onboarding/onboarding-routes';
import { applyOnboardingStepViewport } from '@/features/onboarding/onboarding-viewport';
import { isOnboardingStepVisible } from '@/features/onboarding/evaluate-visibility';
import {
  queryTourTarget,
} from '@/features/onboarding/wait-for-target';
import type {
  OnboardingFlowConfig,
  OnboardingRuntimeContext,
  OnboardingStepConfig,
  ResolvedOnboardingStep,
} from '@/features/onboarding/types';

async function resolveStepTarget(
  step: OnboardingStepConfig,
): Promise<Element | null> {
  return queryTourTarget(step.target);
}

export async function resolveOnboardingSteps(
  flow: OnboardingFlowConfig,
  context: OnboardingRuntimeContext,
  pathname: string,
): Promise<ResolvedOnboardingStep[]> {
  const visibleSteps = flow.steps.filter((step) =>
    isOnboardingStepVisible(step, context),
  );

  const resolved: ResolvedOnboardingStep[] = [];

  for (const step of visibleSteps) {
    const resolvedStep = applyOnboardingStepViewport(step);
    const isDeferred =
      resolvedStep.route != null &&
      !isOnboardingRoute(pathname, resolvedStep.route, resolvedStep.routeMatch);

    if (isDeferred) {
      resolved.push(resolvedStep);
      continue;
    }

    const element = await resolveStepTarget(resolvedStep);
    const missingTargetBehavior = resolvedStep.missingTarget ?? 'wait';

    if (!element && missingTargetBehavior === 'skip') {
      continue;
    }

    resolved.push(resolvedStep);
  }

  return resolved;
}
