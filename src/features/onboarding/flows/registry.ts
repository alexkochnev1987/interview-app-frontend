import { staffFirstLoginFlow } from '@/features/onboarding/flows/staff-first-login';
import type {
  OnboardingFlowConfig,
  OnboardingFlowId,
} from '@/features/onboarding/types';

export const DEFAULT_ONBOARDING_FLOW_ID: OnboardingFlowId = 'staff-first-login';

const ONBOARDING_FLOWS: Record<OnboardingFlowId, OnboardingFlowConfig> = {
  'staff-first-login': staffFirstLoginFlow,
  'admin-onboarding': {
    id: 'admin-onboarding',
    steps: [],
  },
  'feature-tour': {
    id: 'feature-tour',
    steps: [],
  },
};

export function getOnboardingFlow(flowId: OnboardingFlowId): OnboardingFlowConfig {
  return ONBOARDING_FLOWS[flowId];
}

export function listOnboardingFlows(): OnboardingFlowConfig[] {
  return Object.values(ONBOARDING_FLOWS);
}
