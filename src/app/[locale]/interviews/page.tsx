import { redirect } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'

type InterviewsPageProps = {
  params: Promise<{ locale: Locale }>
}

export default async function InterviewsPage({ params }: InterviewsPageProps) {
  const { locale } = await params
  redirect({ href: '/', locale })
}
