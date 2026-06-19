const DEFAULT_WAIT_TIMEOUT_MS = 2000;

export function queryTourTarget(selector: string): Element | null {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.querySelector(selector);
}

export function waitForTourTarget(
  selector: string,
  timeoutMs: number = DEFAULT_WAIT_TIMEOUT_MS,
): Promise<Element | null> {
  const existing = queryTourTarget(selector);
  if (existing) {
    return Promise.resolve(existing);
  }

  if (typeof document === 'undefined') {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const element = queryTourTarget(selector);
      if (!element) {
        return;
      }

      observer.disconnect();
      clearTimeout(timerId);
      resolve(element);
    });

    const timerId = window.setTimeout(() => {
      observer.disconnect();
      resolve(queryTourTarget(selector));
    }, timeoutMs);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
