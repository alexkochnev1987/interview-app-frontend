import { describe, expect, it } from 'vitest'

import {
  ASSISTANT_DECLINE_REGISTERED_CANDIDATE_MESSAGE,
  ASSISTANT_USE_REGISTERED_CANDIDATE_MESSAGE,
  resolveAssistantRegisteredCandidateMessage,
} from '@/components/assistant/assistant-api-contract'
import {
  ASSISTANT_NEW_CANDIDATE_MESSAGE,
  toAssistantCandidateSelection,
  toAssistantNewCandidateSelection,
} from '@/components/assistant/assistant-candidate-selection'

describe('assistant-candidate-selection', () => {
  it('maps a registered candidate to id message and display name', () => {
    expect(
      toAssistantCandidateSelection({
        id: '8d2a6457-7f4b-4cef-9f10-8cff885f7e15',
        name: 'Alice',
      }),
    ).toEqual({
      message: '8d2a6457-7f4b-4cef-9f10-8cff885f7e15',
      displayText: 'Alice',
    })
  })

  it('maps new candidate choice to backend NLU phrase', () => {
    expect(toAssistantNewCandidateSelection('New candidate')).toEqual({
      message: ASSISTANT_NEW_CANDIDATE_MESSAGE,
      displayText: 'New candidate',
    })
  })
})

describe('resolveAssistantRegisteredCandidateMessage', () => {
  it('resolves registered-candidate yes/no messages', () => {
    expect(resolveAssistantRegisteredCandidateMessage('use')).toBe(
      ASSISTANT_USE_REGISTERED_CANDIDATE_MESSAGE,
    )
    expect(resolveAssistantRegisteredCandidateMessage('decline')).toBe(
      ASSISTANT_DECLINE_REGISTERED_CANDIDATE_MESSAGE,
    )
  })
})
