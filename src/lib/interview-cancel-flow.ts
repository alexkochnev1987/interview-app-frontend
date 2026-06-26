type PostCancelInterviewSuccessArgs = {
  closeConfirm: () => void
  push: (href: string) => void
  refresh: () => void
}

export function runPostCancelInterviewSuccess({
  closeConfirm,
  push,
  refresh,
}: PostCancelInterviewSuccessArgs) {
  closeConfirm()
  push('/')
  refresh()
}
