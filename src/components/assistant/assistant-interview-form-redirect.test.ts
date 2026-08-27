import { describe, expect, it } from 'vitest'

import {
  enrichInterviewFormRedirect,
  findRecentInterviewFormRedirect,
  isCreateOwnChoiceMessage,
} from '@/components/assistant/assistant-interview-form-redirect'

describe('assistant-interview-form-redirect', () => {
  it('recognizes create my own phrasing', () => {
    expect(isCreateOwnChoiceMessage('create my own')).toBe(true)
    expect(isCreateOwnChoiceMessage('my own')).toBe(true)
    expect(isCreateOwnChoiceMessage('own')).toBe(true)
    expect(isCreateOwnChoiceMessage('maybe later')).toBe(false)
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

  it('adds candidateEmail from the registered candidate picker history', () => {
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
      { id: '2', role: 'user' as const, text: 'Alice' },
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
})
