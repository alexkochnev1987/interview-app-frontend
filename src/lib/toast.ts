import { toast } from "sonner"

type NotifyOptions = {
  description?: string
  id?: string
}

const DEFAULT_SUCCESS_TITLE = "Done"
const DEFAULT_ERROR_TITLE = "Something went wrong"
const DEFAULT_INFO_TITLE = "Notice"

const TERMINAL_PUNCTUATION = /[.!?:]$/

function toSentence(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return trimmed
  }

  return TERMINAL_PUNCTUATION.test(trimmed) ? trimmed : `${trimmed}.`
}

export function notifySuccess(message = DEFAULT_SUCCESS_TITLE, options?: NotifyOptions) {
  toast.success(toSentence(message), {
    id: options?.id,
    description: options?.description ? toSentence(options.description) : undefined,
  })
}

export function notifyInfo(message = DEFAULT_INFO_TITLE, options?: NotifyOptions) {
  toast.info(toSentence(message), {
    id: options?.id,
    description: options?.description ? toSentence(options.description) : undefined,
  })
}

export function notifyError(message = DEFAULT_ERROR_TITLE, options?: NotifyOptions) {
  toast.error(toSentence(message), {
    id: options?.id,
    description: options?.description ? toSentence(options.description) : undefined,
  })
}
