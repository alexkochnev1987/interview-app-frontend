export type OnboardingFlowId =
  | 'staff-first-login'
  | 'admin-onboarding'
  | 'feature-tour';

export type OnboardingMissingTargetBehavior = 'skip' | 'wait';

export type OnboardingVisibilityRule =
  | { type: 'anyRole'; roles: readonly string[] }
  | { type: 'permission'; permission: string }
  | { type: 'featureFlag'; flag: string }
  | { type: 'canManageTeam' }
  | { type: 'canReadQuestions' }
  | { type: 'canReviewAssessments' }
  | { type: 'canConfigureInterview' };

export type OnboardingStepConfig = {
  id: string;
  target: string;
  contentKey: string;
  route?: string;
  visibility?: readonly OnboardingVisibilityRule[];
  missingTarget?: OnboardingMissingTargetBehavior;
  waitTimeoutMs?: number;
  popoverSide?: 'top' | 'right' | 'bottom' | 'left';
  popoverAlign?: 'start' | 'center' | 'end';
};

export type OnboardingFlowConfig = {
  id: OnboardingFlowId;
  steps: readonly OnboardingStepConfig[];
};

export type OnboardingRuntimeContext = {
  role: string | null | undefined;
  permissions?: readonly string[];
  featureFlags?: Readonly<Record<string, boolean>>;
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
