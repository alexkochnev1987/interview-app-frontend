import { unstable_noStore as noStore } from 'next/cache'

import { InterviewCreateForm } from '@/components/interviews/interview-create-form'
import { InterviewCreateIntro } from '@/components/interviews/interview-create-intro'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import { loadAuthGate } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { prefetchInterviewCreatePicker } from '@/lib/questions-library-prefetch'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

const INTERVIEW_GATE = TOAST_MESSAGES.pageGate.interview

const ERROR_BACK_HREF = '/'
const ERROR_BACK_LABEL = 'Back to dashboard'

export default async function NewInterviewPage() {
  noStore()

  const auth = await loadAuthGate(canConfigureInterview)
  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={INTERVIEW_GATE.forbiddenTitle}
        description={INTERVIEW_GATE.forbiddenDescription}
      />
    )
  }
  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title={INTERVIEW_GATE.createUnavailableTitle}
        description={`We could not verify your session or permissions. ${auth.message}`}
        backHref={ERROR_BACK_HREF}
        backLabel={ERROR_BACK_LABEL}
      />
    )
  }

  let initialPrefetch
  try {
    initialPrefetch = await prefetchInterviewCreatePicker(auth.ctx)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to load questions.'
    return (
      <FlashErrorPageFallback
        title={INTERVIEW_GATE.createUnavailableTitle}
        description={message}
        backHref={ERROR_BACK_HREF}
        backLabel={ERROR_BACK_LABEL}
      />
    )
  }

  return (
    <PageShell>
      <InterviewCreateIntro />
      <InterviewCreateForm initialPrefetch={initialPrefetch} />
    </PageShell>
  )
}
