import { describe, expect, it } from 'vitest'

import {
  ASSISTANT_DECLINE_REGISTERED_CANDIDATE_MESSAGE,
  ASSISTANT_USE_REGISTERED_CANDIDATE_MESSAGE,
} from '@/components/assistant/assistant-api-contract'
import {
  enrichInterviewFormRedirect,
  findCandidateEmailInMessages,
  findRecentInterviewFormRedirect,
  isCreateOwnChoiceMessage,
  shouldInterceptCreateOwnChoice,
} from '@/components/assistant/assistant-interview-form-redirect'

describe('assistant-interview-form-redirect', () => {
  it('recognizes create my own phrasing', () => {
    expect(isCreateOwnChoiceMessage('create my own')).toBe(true)
    expect(isCreateOwnChoiceMessage('my own')).toBe(true)
    expect(isCreateOwnChoiceMessage('own')).toBe(true)
    expect(isCreateOwnChoiceMessage('maybe later')).toBe(false)
  })

  it('only intercepts create-my-own while awaiting template choice', () => {
    const awaitingTemplate = [
      {
        id: '1',
        role: 'assistant' as const,
        text: 'Pick a template.',
        result: {
          status: 'answered' as const,
          response: 'Pick a template.',
          awaitingInput: 'templateChoice' as const,
        },
      },
    ]

    expect(shouldInterceptCreateOwnChoice(awaitingTemplate, 'create my own')).toBe(true)
    expect(shouldInterceptCreateOwnChoice(awaitingTemplate, 'I prefer my own approach')).toBe(true)
    expect(
      shouldInterceptCreateOwnChoice(
        [
          {
            id: '1',
            role: 'assistant',
            text: 'What position?',
            result: {
              status: 'answered',
              response: 'What position?',
              awaitingInput: 'position',
            },
          },
        ],
        'my own startup',
      ),
    ).toBe(false)
  })

  it('finds the latest interview form redirect in chat history', () => {
    expect(
      findRecentInterviewFormRedirect([
        { id: '1', role: 'assistant', text: 'Earlier' },
        {
          id: '2',
          role: 'assistant',
          text: 'No templates found.',
          result: {
            status: 'answered',
            response: 'No templates found.',
            redirect: {
              path: '/interviews/new',
              query: { candidateName: 'Alice', position: 'Senior dev' },
            },
          },
        },
      ]),
    ).toEqual({
      path: '/interviews/new',
      query: { candidateName: 'Alice', position: 'Senior dev' },
    })
  })

  it('adds candidateEmail when the user picks a registered candidate from the list', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant' as const,
        text: 'Pick a candidate.',
        result: {
          status: 'answered' as const,
          response: 'Pick a candidate.',
          awaitingInput: 'candidateChoice' as const,
          candidates: [{ id: 'c1', name: 'Alice', email: 'alice@example.com' }],
        },
      },
      {
        id: '2',
        role: 'user' as const,
        text: 'Alice',
        sentMessage: 'c1',
      },
      {
        id: '3',
        role: 'assistant' as const,
        text: 'No templates found.',
        result: {
          status: 'answered' as const,
          response: 'No templates found.',
          redirect: {
            path: '/interviews/new',
            query: { candidateName: 'Alice', position: 'Senior dev' },
          },
        },
      },
    ]

    expect(enrichInterviewFormRedirect(messages[2].result!.redirect!, messages)).toEqual({
      path: '/interviews/new',
      query: {
        candidateName: 'Alice',
        position: 'Senior dev',
        candidateEmail: 'alice@example.com',
      },
    })
    expect(findRecentInterviewFormRedirect(messages)).toEqual({
      path: '/interviews/new',
      query: {
        candidateName: 'Alice',
        position: 'Senior dev',
        candidateEmail: 'alice@example.com',
      },
    })
  })

  it('does not add candidateEmail after the user declines a registered-candidate match', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant' as const,
        text: 'Use registered Alice?',
        result: {
          status: 'answered' as const,
          response: 'Use registered Alice?',
          awaitingInput: 'confirmRegisteredCandidate' as const,
          candidates: [{ id: 'c1', name: 'Alice', email: 'alice@example.com' }],
        },
      },
      {
        id: '2',
        role: 'user' as const,
        text: 'No, different person',
        sentMessage: ASSISTANT_DECLINE_REGISTERED_CANDIDATE_MESSAGE,
      },
      {
        id: '3',
        role: 'assistant' as const,
        text: 'No templates found.',
        result: {
          status: 'answered' as const,
          response: 'No templates found.',
          redirect: {
            path: '/interviews/new',
            query: { candidateName: 'Alice', position: 'Senior dev' },
          },
        },
      },
    ]

    expect(findCandidateEmailInMessages(messages, 'Alice')).toBeNull()
    expect(enrichInterviewFormRedirect(messages[2].result!.redirect!, messages)).toEqual({
      path: '/interviews/new',
      query: { candidateName: 'Alice', position: 'Senior dev' },
    })
  })

  it('adds candidateEmail when the user confirms a registered-candidate match', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant' as const,
        text: 'Use registered Alice?',
        result: {
          status: 'answered' as const,
          response: 'Use registered Alice?',
          awaitingInput: 'confirmRegisteredCandidate' as const,
          candidates: [{ id: 'c1', name: 'Alice', email: 'alice@example.com' }],
        },
      },
      {
        id: '2',
        role: 'user' as const,
        text: 'Yes',
        sentMessage: ASSISTANT_USE_REGISTERED_CANDIDATE_MESSAGE,
      },
      {
        id: '3',
        role: 'assistant' as const,
        text: 'No templates found.',
        result: {
          status: 'answered' as const,
          response: 'No templates found.',
          redirect: {
            path: '/interviews/new',
            query: { candidateName: 'Alice', position: 'Senior dev' },
          },
        },
      },
    ]

    expect(findCandidateEmailInMessages(messages, 'Alice')).toBe('alice@example.com')
  })
})
