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

const ONBOARDING_POPOVER_GAP = 16;

function resolveInputElement(element: Element | undefined): HTMLInputElement | HTMLTextAreaElement | null {
  if (
    element instanceof HTMLInputElement
    || element instanceof HTMLTextAreaElement
  ) {
    return element;
  }

  const nested = element?.querySelector('input, textarea');
  if (
    nested instanceof HTMLInputElement
    || nested instanceof HTMLTextAreaElement
  ) {
    return nested;
  }

  return null;
}

function hasNonEmptyInputValue(element: Element | undefined): boolean {
  const input = resolveInputElement(element);
  return input ? input.value.trim().length > 0 : false;
}

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
  let gateSync: (() => void) | null = null;
  let isTransitioning = false;
  let transitionId = 0;

  const cleanupGatedStep = () => {
    cleanupEventListener?.();
    cleanupEventListener = null;
    gateSync = null;
  };

  const settleStepLayout = (
    element: Element | undefined,
    driver: Driver,
    step: ResolvedOnboardingStep,
  ) => {
    window.requestAnimationFrame(() => {
      const applyPopoverPlacement = () => {
        if (step.lockPopoverPlacement) {
          const [side, align] = step.lockPopoverPlacement.split('-') as [
            'top' | 'bottom',
            'start' | 'end',
          ];
          lockPopoverToTarget(element, driver, side, align);
          return;
        }

        enforcePopoverGap(element, driver);
      };

      const refresh = () => {
        driver.refresh();
        window.requestAnimationFrame(applyPopoverPlacement);
      };

      if (step.preservePageTop) {
        window.scrollTo({
          top: step.pageScrollTop ?? 0,
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
    const maxFrames = 30;
    let stableFrames = 0;

    for (let frame = 0; frame < maxFrames; frame += 1) {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });

      if (!driver.isActive()) {
        return;
      }

      if (driver.getActiveIndex() === expectedIndex) {
        stableFrames += 1;
        if (stableFrames >= 2) {
          return;
        }
      } else {
        stableFrames = 0;
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

  const lockPopoverToTarget = (
    element: Element | undefined,
    driver: Driver,
    side: 'top' | 'bottom',
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
      const viewportPadding = ONBOARDING_POPOVER_GAP;
      const gap = ONBOARDING_POPOVER_GAP;
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

      if (side === 'bottom') {
        wrapper.style.top = `${targetRect.bottom + gap}px`;
      } else {
        wrapper.style.top = `${targetRect.top - gap - wrapperRect.height}px`;
      }

      wrapper.style.bottom = 'auto';

      if (arrow) {
        arrow.classList.remove(
          'driver-popover-arrow-side-left',
          'driver-popover-arrow-side-right',
          'driver-popover-arrow-side-top',
          'driver-popover-arrow-side-bottom',
          'driver-popover-arrow-side-over',
          'driver-popover-arrow-align-center',
          'driver-popover-arrow-align-end',
          'driver-popover-arrow-align-start',
        );
        arrow.classList.add(
          side === 'bottom'
            ? 'driver-popover-arrow-side-bottom'
            : 'driver-popover-arrow-side-top',
          align === 'end'
            ? 'driver-popover-arrow-align-end'
            : 'driver-popover-arrow-align-start',
        );
      }
    });
  };

  const enforcePopoverGap = (
    element: Element | undefined,
    driver: Driver,
    minGap = ONBOARDING_POPOVER_GAP,
  ) => {
    if (!element) return;

    const popover = driver.getState('popover') as
      | { wrapper?: HTMLElement }
      | undefined;
    const wrapper = popover?.wrapper;
    if (!wrapper) return;

    const targetRect = element.getBoundingClientRect();
    const popoverRect = wrapper.getBoundingClientRect();
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const popoverCenterX = popoverRect.left + popoverRect.width / 2;
    const popoverCenterY = popoverRect.top + popoverRect.height / 2;
    const dx = popoverCenterX - targetCenterX;
    const dy = popoverCenterY - targetCenterY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        const gap = popoverRect.left - targetRect.right;
        if (gap < minGap) {
          wrapper.style.left = `${targetRect.right + minGap}px`;
          wrapper.style.right = 'auto';
        }
      } else {
        const gap = targetRect.left - popoverRect.right;
        if (gap < minGap) {
          wrapper.style.left = `${targetRect.left - minGap - popoverRect.width}px`;
          wrapper.style.right = 'auto';
        }
      }

      return;
    }

    if (dy > 0) {
      const gap = popoverRect.top - targetRect.bottom;
      if (gap < minGap) {
        wrapper.style.top = `${targetRect.bottom + minGap}px`;
        wrapper.style.bottom = 'auto';
      }
      return;
    }

    const gap = targetRect.top - popoverRect.bottom;
    if (gap < minGap) {
      wrapper.style.top = `${targetRect.top - minGap - popoverRect.height}px`;
      wrapper.style.bottom = 'auto';
    }
  };

  const applyStageRadius = (driver: Driver, radius?: number) => {
    const nextRadius = radius ?? DEFAULT_STAGE_RADIUS;
    const config = driver.getConfig();

    if (config.stageRadius === nextRadius) {
      return;
    }

    driver.setConfig({ ...config, stageRadius: nextRadius });
  };

  const setNextDisabled = (driver: Driver, disabled: boolean) => {
    const apply = () => {
      const popover = driver.getState('popover') as
        | {
            nextButton?: HTMLButtonElement;
          }
        | undefined;

      if (!popover?.nextButton) {
        return;
      }

      popover.nextButton.disabled = disabled;
      popover.nextButton.setAttribute('aria-disabled', String(disabled));
    };

    apply();
    window.requestAnimationFrame(apply);
  };

  const focusTourInput = (input: HTMLInputElement | HTMLTextAreaElement) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!input.isConnected) {
          return;
        }

        input.focus({ preventScroll: true });
      });
    });
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
      gateSync?.();
    }
  };

  const setupNonEmptyInputGate = (
    element: Element | undefined,
    driver: Driver,
    options?: { autoFocus?: boolean },
  ) => {
    const input = resolveInputElement(element);
    if (!input) {
      return;
    }

    const sync = () => {
      setNextDisabled(driver, input.value.trim().length === 0);
    };

    sync();
    gateSync = sync;
    input.addEventListener('input', sync);
    cleanupEventListener = () => {
      input.removeEventListener('input', sync);
    };

    if (options?.autoFocus !== false) {
      focusTourInput(input);
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
    const hasNonEmptyInputGate = step.gate?.type === 'nonEmptyInput';
    const lastEventWithNext =
      isEventGatedStep
      && isLast
      && step.advance?.allowNextOnLastEventStep === true;

    return {
      element: step.target,
      popover: {
        title: content.title,
        description: content.description,
        side: step.popoverSide ?? 'bottom',
        align: step.popoverAlign ?? 'start',
        showProgress: true,
        showButtons: isEventGatedStep
          ? (lastEventWithNext
              ? ['previous', 'next', 'close']
              : (previousStep ? ['previous', 'close'] : ['close']))
          : ['next', 'previous', 'close'],
        nextBtnText: lastEventWithNext
          ? labels.next
          : (isLast ? labels.done : labels.next),
        prevBtnText: labels.back,
        doneBtnText: labels.done,
        onPopoverRender: hasNonEmptyInputGate
          ? (popover, { driver }) => {
              const activeElement = driver.getState('activeElement') as
                | Element
                | undefined;
              const input = resolveInputElement(activeElement);
              const isEmpty = !input || input.value.trim().length === 0;
              popover.nextButton.disabled = isEmpty;
              popover.nextButton.setAttribute(
                'aria-disabled',
                String(isEmpty),
              );
            }
          : undefined,
        onNextClick: async (element, _driveStep, { driver }) => {
          if (
            step.gate?.type === 'nonEmptyInput'
            && !hasNonEmptyInputValue(element)
          ) {
            return;
          }

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

        settleStepLayout(element, driver, step);

        if (step.gate?.type === 'nonEmptyInput') {
          setupNonEmptyInputGate(element, driver, {
            autoFocus: step.gate.autoFocus,
          });
        }

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
