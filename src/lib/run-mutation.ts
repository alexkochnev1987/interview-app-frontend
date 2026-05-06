import { notifyError, notifySuccess } from "@/lib/toast"

type RunMutationOptions<TData> = {
  successMessage?: string
  successDescription?: string
  errorMessage?: string
  getSuccessMessage?: (data: TData) => string
  getSuccessDescription?: (data: TData) => string | undefined
  getErrorMessage?: (error: unknown) => string
  showSuccessToast?: boolean
}

const DEFAULT_SUCCESS_MESSAGE = "Action completed"
const DEFAULT_ERROR_MESSAGE = "Action failed"

function getErrorDescription(error: unknown) {
  return error instanceof Error ? error.message : undefined
}

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
    const errorMessage = options?.errorMessage ?? DEFAULT_ERROR_MESSAGE
    const errorDescription =
      options?.getErrorMessage?.(error) ?? getErrorDescription(error)

    notifyError(errorMessage, { description: errorDescription })

    throw error
  }
}
