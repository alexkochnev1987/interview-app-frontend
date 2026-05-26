import { CirclePlus, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Link } from '@/i18n/navigation'

export function InterviewCreateIntro() {
  return (
    <Card variant="floating" size="lg">
      <CardContent spacing="xl">
        <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
          Create Interview Flow
        </EyebrowBadge>
        <Stack gap={3}>
          <HeroTitle>
            Assemble the candidate packet before you send the interview link.
          </HeroTitle>
          <HeroLead width="prose">
            Capture the role, choose only the questions that matter, and keep the decision
            criteria explicit before the recording session starts.
          </HeroLead>
        </Stack>
        <Inline gap={3} wrap="wrap">
          <Button asChild variant="gradient">
            <Link href="/questions/new">
              <CirclePlus className="size-4" />
              Create Question
            </Link>
          </Button>
          <Button asChild variant="outline-pill" shape="pill">
            <Link href="/questions">Open Question Bank</Link>
          </Button>
        </Inline>
      </CardContent>
    </Card>
  )
}
