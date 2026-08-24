import { APP_ROLE, type AppRole } from '@/lib/auth-roles'

import { canUseAssistantQueryPrompt } from './assistant-query-auth'

export type AssistantWelcomeRole = Extract<AppRole, 'super_admin' | 'admin' | 'hr' | 'candidate'>

const WELCOME_ITEM_KEYS: Record<AssistantWelcomeRole, string[]> = {
  [APP_ROLE.hr]: [
    'myInterviews',
    'readyForReview',
    'myAssessments',
    'questionCount',
    'orgOverview',
    'interviewStatus',
    'createFlow',
  ],
  [APP_ROLE.candidate]: ['hasInterview', 'candidateStatus', 'reviewed', 'schedule'],
  [APP_ROLE.admin]: [
    'questionCount',
    'assessments',
    'orgOverview',
    'unassigned',
    'showHrs',
    'filters',
    'teamOverview',
    'teamByRole',
    'assignHr',
    'createFlow',
  ],
  [APP_ROLE.super_admin]: [
    'questionCount',
    'assessments',
    'orgOverview',
    'unassigned',
    'showHrs',
    'filters',
    'teamOverview',
    'teamByRole',
    'assignHr',
    'createFlow',
    'orgQueries',
  ],
}

export function resolveAssistantWelcomeRole(role: string | null | undefined): AssistantWelcomeRole {
  if (
    role === APP_ROLE.super_admin ||
    role === APP_ROLE.admin ||
    role === APP_ROLE.hr ||
    role === APP_ROLE.candidate
  ) {
    return role
  }
  return APP_ROLE.hr
}

export function getWelcomeItemKeys(role: AssistantWelcomeRole): string[] {
  return WELCOME_ITEM_KEYS[role].filter((key) => canUseAssistantQueryPrompt(key, role))
}
