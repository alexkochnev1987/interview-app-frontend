import type { OnboardingEventName } from '@/features/onboarding/onboarding-events';

export type OnboardingFlowId =
  | 'staff-first-login';

export type OnboardingMissingTargetBehavior = 'skip' | 'wait';

export type OnboardingVisibilityRule =
  | { type: 'notDemo' }
  | { type: 'canReadQuestions' }
  | { type: 'canReviewAssessments' }
  | { type: 'canConfigureInterview' };

export type OnboardingAdvanceConfig =
  | { mode?: 'next' }
  | {
      mode: 'event';
      eventName: OnboardingEventName;
    };

export type OnboardingStepConfig = {
  id: string;
  target: string;
  contentKey: string;
  route?: string;
  routeMatch?: 'exact' | 'prefix';
  advance?: OnboardingAdvanceConfig;
  visibility?: readonly OnboardingVisibilityRule[];
  missingTarget?: OnboardingMissingTargetBehavior;
  waitTimeoutMs?: number;
  preservePageTop?: boolean;
  preserveCurrentScroll?: boolean;
  pageScrollTop?: number;
  scrollIntoViewBlock?: ScrollLogicalPosition;
  stageRadius?: number;
  lockPopoverPlacement?: 'bottom-start' | 'bottom-end';
  popoverSide?: 'top' | 'right' | 'bottom' | 'left';
  popoverAlign?: 'start' | 'center' | 'end';
};

export type OnboardingFlowConfig = {
  id: OnboardingFlowId;
  steps: readonly OnboardingStepConfig[];
};

export type OnboardingRuntimeContext = {
  role: string | null | undefined;
  isDemo?: boolean;
};

export type ResolvedOnboardingStep = OnboardingStepConfig;

export type OnboardingStepContent = {
  title: string;
  description: string;
};

export type OnboardingTourLabels = {
  next: string;
  back: string;
  done: string;
  progress: string;
};

export type OnboardingStepTranslator = (
  contentKey: string,
) => OnboardingStepContent;
