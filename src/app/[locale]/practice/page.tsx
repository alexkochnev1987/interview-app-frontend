import { PracticeTakeExperience } from '@/components/take/practice/practice-take-experience'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { enforcePageAuth } from '@/lib/auth-gate'
import { canAccessCandidatePortal } from '@/lib/auth-roles'

interface PracticePageProps {
  params: Promise<{ locale: Locale }>
}

export default async function PracticePage({ params }: PracticePageProps) {
  const { locale } = await params

  const auth = await enforcePageAuth({
    roleCheck: canAccessCandidatePortal,
    locale,
    returnPath: routes.portal.practice,
    gateNamespace: 'practice',
    backHref: routes.portal.home,
  })
  if (!auth.authorized) {
    return auth.fallback
  }

  return <PracticeTakeExperience candidateName={auth.me.name} />
}
