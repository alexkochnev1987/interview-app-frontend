const DEFAULT_WAIT_TIMEOUT_MS = 2000;
const MAX_LAYOUT_FRAMES = 12;

export function queryTourTarget(selector: string): Element | null {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.querySelector(selector);
}

function rectsAreStable(previous: DOMRect, next: DOMRect) {
  return (
    Math.abs(previous.top - next.top) < 0.5 &&
    Math.abs(previous.left - next.left) < 0.5 &&
    Math.abs(previous.width - next.width) < 0.5 &&
    Math.abs(previous.height - next.height) < 0.5
  );
}

function waitForElementLayout(element: Element): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let frames = 0;
    let previousRect: DOMRect | null = null;
    let stableFrames = 0;

    const check = () => {
      const rect = element.getBoundingClientRect();
      const isLaidOut = rect.width > 0 && rect.height > 0;

      if (isLaidOut && previousRect && rectsAreStable(previousRect, rect)) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
      }

      previousRect = rect;

      if ((isLaidOut && stableFrames >= 1) || frames >= MAX_LAYOUT_FRAMES) {
        resolve();
        return;
      }

      frames += 1;
      window.requestAnimationFrame(check);
    };

    window.requestAnimationFrame(check);
  });
}

export function waitForTourTarget(
  selector: string,
  timeoutMs: number = DEFAULT_WAIT_TIMEOUT_MS,
): Promise<Element | null> {
  if (typeof document === 'undefined') {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const finish = (element: Element | null) => {
      if (!element) {
        resolve(null);
        return;
      }

      void waitForElementLayout(element).then(() => resolve(element));
    };

    const existing = queryTourTarget(selector);
    if (existing) {
      finish(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = queryTourTarget(selector);
      if (!element) {
        return;
      }

      observer.disconnect();
      clearTimeout(timerId);
      finish(element);
    });

    const timerId = window.setTimeout(() => {
      observer.disconnect();
      finish(queryTourTarget(selector));
    }, timeoutMs);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
