import type { DriveStep } from 'driver.js';

import type {
  OnboardingStepTranslator,
  OnboardingTourLabels,
  ResolvedOnboardingStep,
} from '@/features/onboarding/types';

type BuildDriverStepsParams = {
  steps: ResolvedOnboardingStep[];
  translateStep: OnboardingStepTranslator;
  labels: OnboardingTourLabels;
  prepareStep: (step: ResolvedOnboardingStep) => Promise<boolean>;
  onDone: () => void;
};

export function buildDriverSteps({
  steps,
  translateStep,
  labels,
  prepareStep,
  onDone,
}: BuildDriverStepsParams): DriveStep[] {
  return steps.map((step, index) => {
    const content = translateStep(step.contentKey);
    const isLast = index === steps.length - 1;
    const nextStep = steps[index + 1];
    const previousStep = steps[index - 1];

    return {
      element: step.target,
      popover: {
        title: content.title,
        description: content.description,
        side: step.popoverSide ?? 'bottom',
        align: step.popoverAlign ?? 'start',
        showProgress: true,
        nextBtnText: isLast ? labels.done : labels.next,
        prevBtnText: labels.back,
        doneBtnText: labels.done,
        onNextClick: async (_element, _driveStep, { driver }) => {
          if (isLast) {
            onDone();
            driver.destroy();
            return;
          }

          if (nextStep) {
            await prepareStep(nextStep);
          }

          driver.moveNext();
        },
        onPrevClick: async (_element, _driveStep, { driver }) => {
          if (previousStep) {
            await prepareStep(previousStep);
          }

          driver.movePrevious();
        },
      },
    };
  });
}
