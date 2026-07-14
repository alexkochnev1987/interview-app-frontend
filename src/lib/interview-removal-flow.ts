type PostInterviewRemovalSuccessArgs = {
  closeConfirm: () => void
  push: (href: string) => void
  invalidateInterviews: () => void
}

export function runPostInterviewRemovalSuccess({
  closeConfirm,
  push,
  invalidateInterviews,
}: PostInterviewRemovalSuccessArgs) {
  closeConfirm()
  invalidateInterviews()
  push('/')
}
