import { toast } from "sonner"

type NotifyOptions = {
  description?: string
  id?: string
}

const DEFAULT_SUCCESS_TITLE = "Done"
const DEFAULT_ERROR_TITLE = "Something went wrong"

function toSentence(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return trimmed
  }

  return trimmed.endsWith(".") ? trimmed : `${trimmed}.`
}

export function notifySuccess(message = DEFAULT_SUCCESS_TITLE, options?: NotifyOptions) {
  toast.success(toSentence(message), {
    description: options?.description ? toSentence(options.description) : undefined,
  })
}

export function notifyError(message = DEFAULT_ERROR_TITLE, options?: NotifyOptions) {
  toast.error(toSentence(message), {
    id: options?.id,
    description: options?.description ? toSentence(options.description) : undefined,
  })
}
