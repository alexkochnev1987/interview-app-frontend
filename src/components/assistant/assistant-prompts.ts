import { APP_ROLE } from '@/lib/auth-roles'

import type { AssistantWelcomeRole } from './assistant-i18n'

export type AssistantPromptKey = string

const WRITE_PROMPT_KEYS = new Set<AssistantPromptKey>([
  'createInterview',
  'assignHr',
  'createQuestion',
])

const PROMPT_KEYS: Record<AssistantWelcomeRole, AssistantPromptKey[]> = {
  [APP_ROLE.hr]: ['myInterviews', 'readyForReview', 'createInterview'],
  [APP_ROLE.candidate]: ['hasInterview', 'status', 'reviewed'],
  [APP_ROLE.admin]: ['unassigned', 'byStatus', 'assignHr', 'createQuestion'],
  [APP_ROLE.super_admin]: ['unassigned', 'byStatus', 'assignHr', 'createQuestion', 'orgOverview'],
}

export function getAssistantPromptKeys(
  welcomeRole: AssistantWelcomeRole,
  options?: { excludeWrite?: boolean },
): AssistantPromptKey[] {
  const keys = PROMPT_KEYS[welcomeRole]
  if (!options?.excludeWrite) return keys
  return keys.filter((key) => !WRITE_PROMPT_KEYS.has(key))
}

export function isAssistantWritePromptKey(promptKey: AssistantPromptKey): boolean {
  return WRITE_PROMPT_KEYS.has(promptKey)
}

export function getAssistantPromptMessageKey(
  role: AssistantWelcomeRole,
  promptKey: AssistantPromptKey,
): `prompts.${AssistantWelcomeRole}.${string}` {
  return `prompts.${role}.${promptKey}`
}
