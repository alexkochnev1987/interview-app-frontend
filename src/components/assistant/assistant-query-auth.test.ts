import { describe, expect, it } from 'vitest'

import { canUseAssistantQueryPrompt } from './assistant-query-auth'

describe('assistant-query-auth', () => {
  describe('questionCount', () => {
    it.each(['super_admin', 'admin', 'hr'] as const)('allows %s', (role) => {
      expect(canUseAssistantQueryPrompt('questionCount', role)).toBe(true)
    })

    it('denies candidate', () => {
      expect(canUseAssistantQueryPrompt('questionCount', 'candidate')).toBe(false)
    })
  })

  describe('assessments and myAssessments', () => {
    it.each(['assessments', 'myAssessments'] as const)('%s allows admin roles', (promptKey) => {
      for (const role of ['super_admin', 'admin', 'hr'] as const) {
        expect(canUseAssistantQueryPrompt(promptKey, role)).toBe(true)
      }
    })

    it.each(['assessments', 'myAssessments'] as const)('%s denies candidate', (promptKey) => {
      expect(canUseAssistantQueryPrompt(promptKey, 'candidate')).toBe(false)
    })
  })

  describe('orgOverview', () => {
    it.each(['super_admin', 'admin', 'hr'] as const)('allows %s', (role) => {
      expect(canUseAssistantQueryPrompt('orgOverview', role)).toBe(true)
    })

    it('denies candidate', () => {
      expect(canUseAssistantQueryPrompt('orgOverview', 'candidate')).toBe(false)
    })
  })

  describe('teamOverview and teamByRole', () => {
    it.each(['teamOverview', 'teamByRole'] as const)(
      '%s allows super_admin and admin',
      (promptKey) => {
        expect(canUseAssistantQueryPrompt(promptKey, 'super_admin')).toBe(true)
        expect(canUseAssistantQueryPrompt(promptKey, 'admin')).toBe(true)
      },
    )

    it.each(['teamOverview', 'teamByRole'] as const)('%s denies hr and candidate', (promptKey) => {
      expect(canUseAssistantQueryPrompt(promptKey, 'hr')).toBe(false)
      expect(canUseAssistantQueryPrompt(promptKey, 'candidate')).toBe(false)
    })
  })

  describe('non-query prompts', () => {
    it('allows prompts without explicit query auth', () => {
      expect(canUseAssistantQueryPrompt('unassigned', 'candidate')).toBe(true)
      expect(canUseAssistantQueryPrompt('hasInterview', null)).toBe(true)
    })
  })
})
