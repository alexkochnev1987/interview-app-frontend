import { notifyError, notifySuccess } from "@/lib/toast"
import { getErrorMessage as getApiErrorMessage } from '@/lib/api-error'
//do NOT try to change the name to getErrorMessage , that might break interview/team/take call sites

type RunMutationOptions<TData> = {
  successMessage?: string
  successDescription?: string
  errorMessage?: string
  getSuccessMessage?: (data: TData) => string
  getSuccessDescription?: (data: TData) => string | undefined
  getErrorTitle?: (error: unknown) => string
  getErrorMessage?: (error: unknown) => string
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

const DEFAULT_SUCCESS_MESSAGE = "Action completed"
const DEFAULT_ERROR_MESSAGE = "Action failed"

export async function runMutation<TData>(
  mutation: () => Promise<TData>,
  options?: RunMutationOptions<TData>
) {
  try {
    const data = await mutation()

    if (options?.showSuccessToast !== false) {
      const successMessage =
        options?.getSuccessMessage?.(data) ??
        options?.successMessage ??
        DEFAULT_SUCCESS_MESSAGE
      const successDescription =
        options?.getSuccessDescription?.(data) ?? options?.successDescription

      notifySuccess(successMessage, { description: successDescription })
    }

    return data
  } catch (error) {
    const errorMessage =
      options?.getErrorTitle?.(error) ??
      options?.errorMessage ??
      DEFAULT_ERROR_MESSAGE
    const errorDescription =
      options?.getErrorMessage?.(error) ?? getApiErrorMessage(error)

    if (options?.showErrorToast !== false) {
      notifyError(errorMessage, { description: errorDescription })
    }

    throw error
  }
}
