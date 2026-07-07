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
      id: 'questions-library',
      route: '/questions',
      target: '[data-tour="questions-library"]',
      contentKey: 'questionsLibrary',
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
      target: '[data-tour="assessments-card"]',
      contentKey: 'assessmentsBrowse',
      visibility: [{ type: 'canReviewAssessments' }],
      ...pageTourStepDefaults,
      popoverSide: 'right',
      popoverAlign: 'center',
    },
    {
      id: 'interview-intro',
      route: '/interviews/new',
      target: '[data-tour="interview-candidate"]',
      contentKey: 'interviewIntro',
      visibility: [{ type: 'canConfigureInterview' }],
      ...pageTourStepDefaults,
      popoverSide: 'right',
      popoverAlign: 'start',
    },
    {
      id: 'team-actions',
      route: '/team',
      target: '[data-tour="team-actions"]',
      contentKey: 'teamActions',
      visibility: [{ type: 'canManageTeam' }],
      ...pageTourStepDefaults,
      popoverSide: 'left',
      popoverAlign: 'center',
    },
  ],
};
