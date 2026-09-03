import { describe, expect, it } from 'vitest'

import {
  ASSISTANT_CONFIRM_MESSAGE,
  ASSISTANT_CREATE_OWN_MESSAGE,
  ASSISTANT_DECLINE_REGISTERED_CANDIDATE_MESSAGE,
  ASSISTANT_MACHINE_PROTOCOL_MESSAGES,
  ASSISTANT_NEW_CANDIDATE_MESSAGE,
  ASSISTANT_SIMILARITY_ABORT_MESSAGE,
  ASSISTANT_SIMILARITY_CONTINUE_MESSAGE,
  ASSISTANT_USE_REGISTERED_CANDIDATE_MESSAGE,
  buildAssistantUserMessage,
  resolveAssistantRegisteredCandidateMessage,
  resolveAssistantSimilarityMessage,
} from './assistant-api-contract'

describe('assistant machine protocol', () => {
  it('keeps wire messages in English', () => {
    expect(ASSISTANT_MACHINE_PROTOCOL_MESSAGES).toEqual([
      'confirm',
      'yes',
      'no cancel',
      'yes',
      'no',
      'new candidate',
      'create my own',
    ])
  })

  it('resolves similarity intents to wire messages', () => {
    expect(resolveAssistantSimilarityMessage('continue')).toBe(
      ASSISTANT_SIMILARITY_CONTINUE_MESSAGE,
    )
    expect(resolveAssistantSimilarityMessage('abort')).toBe(ASSISTANT_SIMILARITY_ABORT_MESSAGE)
  })

  it('resolves registered-candidate intents to wire messages', () => {
    expect(resolveAssistantRegisteredCandidateMessage('use')).toBe(
      ASSISTANT_USE_REGISTERED_CANDIDATE_MESSAGE,
    )
    expect(resolveAssistantRegisteredCandidateMessage('decline')).toBe(
      ASSISTANT_DECLINE_REGISTERED_CANDIDATE_MESSAGE,
    )
  })

  it('stores localized bubble text separately from wire payloads', () => {
    expect(buildAssistantUserMessage(ASSISTANT_CONFIRM_MESSAGE, 'Подтвердить')).toEqual({
      text: 'Подтвердить',
      sentMessage: ASSISTANT_CONFIRM_MESSAGE,
    })
    expect(buildAssistantUserMessage(ASSISTANT_NEW_CANDIDATE_MESSAGE, 'Новы кандыдат')).toEqual({
      text: 'Новы кандыдат',
      sentMessage: ASSISTANT_NEW_CANDIDATE_MESSAGE,
    })
    expect(buildAssistantUserMessage('yes', 'yes')).toEqual({ text: 'yes' })
    expect(buildAssistantUserMessage(ASSISTANT_CREATE_OWN_MESSAGE)).toEqual({
      text: ASSISTANT_CREATE_OWN_MESSAGE,
    })
  })
})
