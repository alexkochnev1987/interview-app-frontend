import type { OnboardingFlowConfig, OnboardingStepConfig } from '@/features/onboarding/types';

const pageTourStepDefaults = {
  missingTarget: 'wait',
  waitTimeoutMs: 5000,
  popoverSide: 'bottom',
  popoverAlign: 'start',
} as const satisfies Partial<OnboardingStepConfig>;

export const staffFirstLoginFlow: OnboardingFlowConfig = {
  id: 'staff-first-login',
  steps: [
    {
      id: 'dashboard-hero',
      route: '/',
      target: '[data-tour="dashboard-hero"]',
      contentKey: 'dashboardHero',
      ...pageTourStepDefaults,
    },
    {
      id: 'dashboard-actions',
      route: '/',
      target: '[data-tour="dashboard-actions"]',
      contentKey: 'dashboardActions',
      ...pageTourStepDefaults,
    },
    {
      id: 'questions-library',
      route: '/questions',
      target: '[data-tour="questions-library"]',
      contentKey: 'questionsLibrary',
      visibility: [{ type: 'canReadQuestions' }],
      ...pageTourStepDefaults,
    },
    {
      id: 'questions-create',
      route: '/questions',
      target: '[data-tour="questions-create"]',
      contentKey: 'questionsCreate',
      visibility: [{ type: 'canReadQuestions' }],
      ...pageTourStepDefaults,
    },
    {
      id: 'assessments-intro',
      route: '/assessments',
      target: '[data-tour="assessments-intro"]',
      contentKey: 'assessmentsIntro',
      visibility: [{ type: 'canReviewAssessments' }],
      ...pageTourStepDefaults,
    },
    {
      id: 'assessments-browse',
      route: '/assessments',
      target: '[data-tour="assessments-browse"]',
      contentKey: 'assessmentsBrowse',
      visibility: [{ type: 'canReviewAssessments' }],
      ...pageTourStepDefaults,
    },
    {
      id: 'interview-intro',
      route: '/interviews/new',
      target: '[data-tour="interview-intro"]',
      contentKey: 'interviewIntro',
      visibility: [{ type: 'canConfigureInterview' }],
      ...pageTourStepDefaults,
    },
    {
      id: 'interview-candidate',
      route: '/interviews/new',
      target: '[data-tour="interview-candidate"]',
      contentKey: 'interviewCandidate',
      visibility: [{ type: 'canConfigureInterview' }],
      ...pageTourStepDefaults,
    },
    {
      id: 'interview-picker',
      route: '/interviews/new',
      target: '[data-tour="interview-picker"]',
      contentKey: 'interviewPicker',
      visibility: [{ type: 'canConfigureInterview' }],
      ...pageTourStepDefaults,
    },
    {
      id: 'team-heading',
      route: '/team',
      target: '[data-tour="team-heading"]',
      contentKey: 'teamHeading',
      visibility: [{ type: 'canManageTeam' }],
      ...pageTourStepDefaults,
    },
  ],
};
