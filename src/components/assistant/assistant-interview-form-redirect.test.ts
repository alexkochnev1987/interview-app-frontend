import { describe, expect, it } from 'vitest'

import {
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
})
