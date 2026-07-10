type PostDeleteInterviewSuccessArgs = {
  closeConfirm: () => void
  push: (href: string) => void
  refresh: () => void
}

export function runPostDeleteInterviewSuccess({
  closeConfirm,
  push,
  refresh,
}: PostDeleteInterviewSuccessArgs) {
  closeConfirm()
  push('/')
  refresh()
}
