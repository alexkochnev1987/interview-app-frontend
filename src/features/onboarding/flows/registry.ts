import { staffFirstLoginFlow } from '@/features/onboarding/flows/staff-first-login';
import type {
  OnboardingFlowConfig,
  OnboardingFlowId,
} from '@/features/onboarding/types';

export const DEFAULT_ONBOARDING_FLOW_ID: OnboardingFlowId = 'staff-first-login';

const ONBOARDING_FLOWS: Record<OnboardingFlowId, OnboardingFlowConfig> = {
  'staff-first-login': staffFirstLoginFlow,
};

export function getOnboardingFlow(flowId: OnboardingFlowId): OnboardingFlowConfig {
  return ONBOARDING_FLOWS[flowId];
}
