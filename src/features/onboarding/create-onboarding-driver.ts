import type { DriveStep, Driver } from 'driver.js';

import type { OnboardingTourLabels } from '@/features/onboarding/types';

import '@/components/ui/onboarding/onboarding-tour.css';

export const DEFAULT_STAGE_RADIUS = 14;

export type CreateOnboardingDriverParams = {
  steps: DriveStep[];
  labels: OnboardingTourLabels;
  isComplete: () => boolean;
  onSkip: () => void;
};

export async function createOnboardingDriver(
  params: CreateOnboardingDriverParams,
): Promise<Driver> {
  const { driver } = await import('driver.js');

  const instance = driver({
    steps: params.steps,
    animate: true,
    smoothScroll: false,
    showProgress: true,
    progressText: params.labels.progress,
    nextBtnText: params.labels.next,
    prevBtnText: params.labels.back,
    doneBtnText: params.labels.done,
    popoverClass: 'onboarding-tour-popover',
    overlayOpacity: 0.45,
    stagePadding: 0,
    stageRadius: DEFAULT_STAGE_RADIUS,
    popoverOffset: 16,
    allowClose: true,
    overlayClickBehavior: () => {},
    onCloseClick: () => {
      instance.destroy();
    },
    onDestroyed: () => {
      if (params.isComplete()) {
        return;
      }

      params.onSkip();
    },
  });

  return instance;
}

export async function destroyOnboardingDriver(
  instance: Driver | null | undefined,
): Promise<void> {
  instance?.destroy();
}
