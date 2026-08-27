import { canManageTeam, canReadQuestions, canReviewAssessments } from '@/lib/auth-roles'

export type AssistantQueryPromptKey =
  | 'questionCount'
  | 'assessments'
  | 'myAssessments'
  | 'orgOverview'
  | 'teamOverview'
  | 'teamByRole'

const QUERY_PROMPT_AUTH: Record<
  AssistantQueryPromptKey,
  (role: string | null | undefined) => boolean
> = {
  questionCount: canReadQuestions,
  assessments: canReviewAssessments,
  myAssessments: canReviewAssessments,
  orgOverview: canReviewAssessments,
  teamOverview: canManageTeam,
  teamByRole: canManageTeam,
}

function isAssistantQueryPromptKey(key: string): key is AssistantQueryPromptKey {
  return key in QUERY_PROMPT_AUTH
}

export function canUseAssistantQueryPrompt(
  promptKey: string,
  role: string | null | undefined,
): boolean {
  if (!isAssistantQueryPromptKey(promptKey)) {
    return true
  }

  return QUERY_PROMPT_AUTH[promptKey](role)
}
