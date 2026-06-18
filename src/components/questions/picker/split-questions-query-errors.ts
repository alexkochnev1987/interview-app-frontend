export type SplitQuestionsQueryErrors = {
  blockingError: string | null
  paginationError: string | null
}

export function splitListQueryErrors(
  errorMessage: string | null,
  visibleItemCount: number,
  isPlaceholderData: boolean,
): SplitQuestionsQueryErrors {
  if (!errorMessage) {
    return { blockingError: null, paginationError: null }
  }
  const paginationError =
    visibleItemCount > 0 && isPlaceholderData ? errorMessage : null
  const blockingError = paginationError == null ? errorMessage : null
  return { blockingError, paginationError }
}

export function splitInfiniteQueryErrors(
  errorMessage: string | null,
  visibleItemCount: number,
  isPlaceholderData: boolean,
): SplitQuestionsQueryErrors {
  if (!errorMessage) {
    return { blockingError: null, paginationError: null }
  }
  const paginationError =
    visibleItemCount > 0 && !isPlaceholderData ? errorMessage : null
  const blockingError = paginationError == null ? errorMessage : null
  return { blockingError, paginationError }
}
