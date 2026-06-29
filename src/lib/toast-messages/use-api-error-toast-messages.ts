import { useTranslations } from 'next-intl'

import { resolveApiErrorMessage } from '../api-error'

export function useApiErrorToastMessages() {
  const tApiErrors = useTranslations('apiErrors')

  return {
    message(error: unknown) {
      return resolveApiErrorMessage(error, {
        has: tApiErrors.has,
        t: tApiErrors,
      })
    },
  }
}
