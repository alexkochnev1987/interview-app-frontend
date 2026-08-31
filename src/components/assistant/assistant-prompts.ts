import { APP_ROLE } from '@/lib/auth-roles'

import type { AssistantWelcomeRole } from './assistant-i18n'
import { canUseAssistantQueryPrompt } from './assistant-query-auth'

export type AssistantPromptKey = string

const WRITE_PROMPT_KEYS = new Set<AssistantPromptKey>([
  'createInterview',
  'assignHr',
  'createQuestion',
])

const PROMPT_KEYS: Record<AssistantWelcomeRole, AssistantPromptKey[]> = {
  [APP_ROLE.hr]: [
    'myInterviews',
    'readyForReview',
    'myAssessments',
    'questionCount',
    'orgOverview',
    'createInterview',
  ],
  [APP_ROLE.candidate]: [
    'latestStatus',
    'statusByPosition',
    'reviewedByPosition',
    'openInterviews',
  ],
  [APP_ROLE.admin]: [
    'questionCount',
    'assessments',
    'orgOverview',
    'unassigned',
    'showHrs',
    'byStatus',
    'teamOverview',
    'teamByRole',
    'assignHr',
    'createQuestion',
  ],
  [APP_ROLE.super_admin]: [
    'questionCount',
    'assessments',
    'orgOverview',
    'unassigned',
    'showHrs',
    'byStatus',
    'teamOverview',
    'teamByRole',
    'assignHr',
    'createQuestion',
  ],
}

export function getAssistantPromptKeys(
  welcomeRole: AssistantWelcomeRole,
  options?: { excludeWrite?: boolean },
): AssistantPromptKey[] {
  let keys = PROMPT_KEYS[welcomeRole].filter((key) => canUseAssistantQueryPrompt(key, welcomeRole))
  if (!options?.excludeWrite) return keys
  return keys.filter((key) => !WRITE_PROMPT_KEYS.has(key))
}

export function getAssistantPromptMessageKey(
  role: AssistantWelcomeRole,
  promptKey: AssistantPromptKey,
): `prompts.${AssistantWelcomeRole}.${string}` {
  return `prompts.${role}.${promptKey}`
}
