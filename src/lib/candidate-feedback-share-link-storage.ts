type StoredCandidateFeedbackShareLink = {
  url: string
  expiresAt: string
}

function storageKey(interviewId: string): string {
  return `candidate-feedback-share-link:${interviewId}`
}

export function candidateFeedbackShareExpiresAtMatches(
  left: string,
  right: string,
): boolean {
  if (left === right) {
    return true
  }
  const leftMs = Date.parse(left)
  const rightMs = Date.parse(right)
  if (Number.isNaN(leftMs) || Number.isNaN(rightMs)) {
    return false
  }
  return leftMs === rightMs
}

export function readStoredCandidateFeedbackShareLink(
  interviewId: string,
): StoredCandidateFeedbackShareLink | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(storageKey(interviewId))
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<StoredCandidateFeedbackShareLink>
    if (
      typeof parsed.url !== 'string' ||
      !parsed.url.trim() ||
      typeof parsed.expiresAt !== 'string' ||
      !parsed.expiresAt.trim()
    ) {
      return null
    }
    return { url: parsed.url, expiresAt: parsed.expiresAt }
  } catch {
    return null
  }
}

export function writeStoredCandidateFeedbackShareLink(
  interviewId: string,
  value: StoredCandidateFeedbackShareLink,
): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(storageKey(interviewId), JSON.stringify(value))
  } catch {
    // Ignore quota / private-mode failures; in-memory URL still works for the session.
  }
}

export function clearStoredCandidateFeedbackShareLink(
  interviewId: string,
): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.removeItem(storageKey(interviewId))
  } catch {
    // Ignore storage failures.
  }
}
