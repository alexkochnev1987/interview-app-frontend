import { isOnboardingRoute } from '@/features/onboarding/onboarding-routes';
import { isOnboardingStepVisible } from '@/features/onboarding/evaluate-visibility';
import {
  queryTourTarget,
  waitForTourTarget,
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
  const behavior = step.missingTarget ?? 'skip';
  const timeoutMs = step.waitTimeoutMs ?? 2000;

  if (behavior === 'wait') {
    return waitForTourTarget(step.target, timeoutMs);
  }

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
    const isDeferred =
      step.route != null &&
      !isOnboardingRoute(pathname, step.route, step.routeMatch);

    if (isDeferred) {
      resolved.push(step);
      continue;
    }

    const element = await resolveStepTarget(step);
    if (!element) {
      continue;
    }

    resolved.push(step);
  }

  return resolved;
}
