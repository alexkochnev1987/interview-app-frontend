'use client'

import { BulletList } from '@/components/ui/bullet-list'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { BodyText } from '@/components/ui/text'
import { type QuestionDeleteBlockingInterview } from '@/lib/api'

interface QuestionDeleteBlockingInterviewsProps {
  interviews: QuestionDeleteBlockingInterview[]
}

export function QuestionDeleteBlockingInterviews({
  interviews,
}: QuestionDeleteBlockingInterviewsProps) {
  if (interviews.length === 0) {
    return null
  }

  return (
    <BulletList gap={1}>
      {interviews.map((interview) => (
        <li key={interview.id}>
          <UnstyledLink href={interview.href}>
            <BodyText as="span" size="sm" tone="primary" weight="medium">
              {interview.candidateName}
            </BodyText>
          </UnstyledLink>
        </li>
      ))}
    </BulletList>
  )
}
