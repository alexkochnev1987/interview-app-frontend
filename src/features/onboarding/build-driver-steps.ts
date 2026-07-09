import type { DriveStep, Driver } from 'driver.js';

import type {
  OnboardingStepTranslator,
  OnboardingTourLabels,
  ResolvedOnboardingStep,
} from '@/features/onboarding/types';
import {
  listenForOnboardingEvent,
  type OnboardingEventDetail,
} from '@/features/onboarding/onboarding-events';
import { storeOnboardingCreatedQuestionId } from '@/features/onboarding/onboarding-progress';
import { DEFAULT_STAGE_RADIUS } from '@/features/onboarding/create-onboarding-driver';

type BuildDriverStepsParams = {
  steps: ResolvedOnboardingStep[];
  translateStep: OnboardingStepTranslator;
  labels: OnboardingTourLabels;
  prepareStep: (
    step: ResolvedOnboardingStep,
    detail?: OnboardingEventDetail,
  ) => Promise<boolean>;
  onStepActive: (step: ResolvedOnboardingStep) => void;
  onDone: () => void;
};

export function buildDriverSteps({
  steps,
  translateStep,
  labels,
  prepareStep,
  onStepActive,
  onDone,
}: BuildDriverStepsParams): DriveStep[] {
  let cleanupEventListener: (() => void) | null = null;
  let preservedScrollTop: number | null = null;
  let isTransitioning = false;
  let transitionId = 0;

  const cleanupGatedStep = () => {
    cleanupEventListener?.();
    cleanupEventListener = null;
  };

  const settleStepLayout = (
    element: Element | undefined,
    driver: Driver,
    step: ResolvedOnboardingStep,
    scrollTopOverride?: number | null,
  ) => {
    window.requestAnimationFrame(() => {
      const applyLockedPlacement = () => {
        if (step.lockPopoverPlacement === 'bottom-start') {
          lockPopoverBelowTarget(element, driver, 'start');
        } else if (step.lockPopoverPlacement === 'bottom-end') {
          lockPopoverBelowTarget(element, driver, 'end');
        }
      };

      const refresh = () => {
        driver.refresh();
        applyLockedPlacement();
      };

      if (scrollTopOverride !== undefined && scrollTopOverride !== null) {
        window.scrollTo({
          top: scrollTopOverride,
          left: 0,
          behavior: 'instant',
        });
        window.requestAnimationFrame(refresh);
        return;
      }

      refresh();
    });
  };

  const waitForDriverSettle = async (
    driver: Driver,
    expectedIndex: number,
  ): Promise<void> => {
    for (let frame = 0; frame < 60; frame += 1) {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });

      if (!driver.isActive()) {
        return;
      }

      if (driver.getActiveIndex() === expectedIndex) {
        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => resolve());
        });
        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => resolve());
        });
        return;
      }
    }
  };

  const navigateToStepIndex = (
    driver: Driver,
    fromIndex: number,
    targetIndex: number,
  ) => {
    if (fromIndex === targetIndex) {
      driver.refresh();
      return;
    }

    const delta = targetIndex - fromIndex;

    if (delta === 1 && driver.hasNextStep()) {
      driver.moveNext();
      return;
    }

    if (delta === -1 && driver.hasPreviousStep()) {
      driver.movePrevious();
      return;
    }

    driver.drive(targetIndex);
  };

  const rememberScrollForStep = (
    step: ResolvedOnboardingStep | undefined,
    direction: 1 | -1,
  ) => {
    if (direction === 1 && step?.preserveCurrentScroll) {
      preservedScrollTop = window.scrollY;
    }
  };

  const lockPopoverBelowTarget = (
    element: Element | undefined,
    driver: Driver,
    align: 'start' | 'end',
  ) => {
    if (!element) return;

    window.requestAnimationFrame(() => {
      const popover = driver.getState('popover') as
        | { wrapper?: HTMLElement; arrow?: HTMLElement }
        | undefined;
      const wrapper = popover?.wrapper;
      const arrow = popover?.arrow;
      if (!wrapper) return;

      const targetRect = element.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const viewportPadding = 16;
      const gap = 14;
      const preferredLeft =
        align === 'end'
          ? targetRect.right - wrapperRect.width
          : targetRect.left;
      const left = Math.min(
        Math.max(preferredLeft, viewportPadding),
        window.innerWidth - wrapperRect.width - viewportPadding,
      );

      wrapper.style.left = `${left}px`;
      wrapper.style.right = 'auto';
      wrapper.style.top = `${targetRect.bottom + gap}px`;
      wrapper.style.bottom = 'auto';

      if (arrow) {
        arrow.classList.remove(
          'driver-popover-arrow-side-left',
          'driver-popover-arrow-side-right',
          'driver-popover-arrow-side-top',
          'driver-popover-arrow-side-over',
          'driver-popover-arrow-align-center',
          'driver-popover-arrow-align-end',
          'driver-popover-arrow-align-start',
        );
        arrow.classList.add(
          'driver-popover-arrow-side-bottom',
          align === 'end'
            ? 'driver-popover-arrow-align-end'
            : 'driver-popover-arrow-align-start',
        );
      }
    });
  };

  const applyStageRadius = (driver: Driver, radius?: number) => {
    const nextRadius = radius ?? DEFAULT_STAGE_RADIUS;
    const config = driver.getConfig();

    if (config.stageRadius === nextRadius) {
      return;
    }

    driver.setConfig({ ...config, stageRadius: nextRadius });
  };

  const setNavigationDisabled = (driver: Driver, disabled: boolean) => {
    const popover = driver.getState('popover') as
      | {
          previousButton?: HTMLButtonElement;
          nextButton?: HTMLButtonElement;
        }
      | undefined;

    if (popover?.previousButton) {
      popover.previousButton.disabled = disabled;
    }

    if (popover?.nextButton) {
      popover.nextButton.disabled = disabled;
    }
  };

  const beginNavigation = (driver: Driver): number | null => {
    if (isTransitioning) {
      return null;
    }

    isTransitioning = true;
    const token = transitionId + 1;
    transitionId = token;
    cleanupGatedStep();
    setNavigationDisabled(driver, true);
    return token;
  };

  const isCurrentNavigation = (token: number) => transitionId === token;

  const finishNavigation = (driver: Driver, token: number) => {
    if (!isCurrentNavigation(token)) {
      return;
    }

    isTransitioning = false;

    if (driver.isActive()) {
      setNavigationDisabled(driver, false);
    }
  };

  const completeTour = (driver: Driver) => {
    onDone();
    driver.destroy();
  };

  const moveToPreparedStep = async (
    driver: Driver,
    fromIndex: number,
    targetIndex: number,
    direction: 1 | -1,
    token: number,
    detail?: OnboardingEventDetail,
  ) => {
    if (!isCurrentNavigation(token)) {
      return false
    }

    if (targetIndex < 0 || targetIndex >= steps.length) {
      return false
    }

    const candidateStep = steps[targetIndex]
    rememberScrollForStep(candidateStep, direction)
    const targetReady = await prepareStep(candidateStep, detail)

    if (!isCurrentNavigation(token)) {
      return false
    }

    if (!targetReady) {
      if (direction === 1 && targetIndex === steps.length - 1) {
        completeTour(driver)
        return true
      }

      return false
    }

    navigateToStepIndex(driver, fromIndex, targetIndex)
    await waitForDriverSettle(driver, targetIndex)
    return true
  }

  const moveFromActiveStep = async (
    driver: Driver,
    direction: 1 | -1,
    detail?: OnboardingEventDetail,
  ) => {
    const token = beginNavigation(driver);
    if (token === null) {
      return;
    }

    try {
      const fromIndex = driver.getActiveIndex();

      if (fromIndex === undefined) {
        return;
      }

      if (direction === -1) {
        preservedScrollTop = null;
      }

      if (direction === 1 && fromIndex >= steps.length - 1) {
        completeTour(driver);
        return;
      }

      const targetIndex = fromIndex + direction;

      await moveToPreparedStep(
        driver,
        fromIndex,
        targetIndex,
        direction,
        token,
        detail,
      );
    } finally {
      finishNavigation(driver, token);
    }
  };

  return steps.map((step, index) => {
    const content = translateStep(step.contentKey);
    const isLast = index === steps.length - 1;
    const previousStep = steps[index - 1];
    const isEventGatedStep = step.advance?.mode === 'event';

    return {
      element: step.target,
      popover: {
        title: content.title,
        description: content.description,
        side: step.popoverSide ?? 'bottom',
        align: step.popoverAlign ?? 'start',
        showProgress: true,
        showButtons: isEventGatedStep
          ? (previousStep ? ['previous', 'close'] : ['close'])
          : ['next', 'previous', 'close'],
        nextBtnText: isLast ? labels.done : labels.next,
        prevBtnText: labels.back,
        doneBtnText: labels.done,
        onNextClick: async (_element, _driveStep, { driver }) => {
          await moveFromActiveStep(driver, 1);
        },
        onPrevClick: async (_element, _driveStep, { driver }) => {
          await moveFromActiveStep(driver, -1);
        },
      },
      onHighlighted: (element, _driveStep, { driver }) => {
        cleanupGatedStep();
        onStepActive(step);

        applyStageRadius(driver, step.stageRadius);

        let scrollTopOverride: number | null = null;
        if (step.preserveCurrentScroll && preservedScrollTop !== null) {
          scrollTopOverride = preservedScrollTop;
          preservedScrollTop = null;
        }

        settleStepLayout(element, driver, step, scrollTopOverride);

        if (step.advance?.mode !== 'event') {
          return;
        }

        cleanupEventListener = listenForOnboardingEvent(
          step.advance.eventName,
          async (detail) => {
            if (detail.questionId) {
              storeOnboardingCreatedQuestionId(detail.questionId);
            }

            const token = beginNavigation(driver);
            if (token === null) {
              return;
            }

            try {
              const fromIndex = driver.getActiveIndex() ?? index;

              if (fromIndex >= steps.length - 1) {
                completeTour(driver);
                return;
              }

              await moveToPreparedStep(
                driver,
                fromIndex,
                fromIndex + 1,
                1,
                token,
                detail,
              );
            } finally {
              finishNavigation(driver, token);
            }
          },
        );
      },
      onDeselected: cleanupGatedStep,
    };
  });
}
