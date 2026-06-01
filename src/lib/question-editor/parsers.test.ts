import { describe, expect, it } from 'vitest'

import {
  normalizeInitialValue,
  parseExpectedConcepts,
  parseMetadata,
  parseRedFlags,
  parseStringList,
} from '@/lib/question-editor/parsers'

describe('question-editor parsers', () => {
  const mustBeObject = 'Metadata must be a JSON object'

  it('parses metadata and string lists', () => {
    expect(parseMetadata('   ', mustBeObject)).toEqual({})
    expect(parseMetadata('{"k":1}', mustBeObject)).toEqual({ k: 1 })
    expect(() => parseMetadata('[]', mustBeObject)).toThrow(mustBeObject)
    expect(parseStringList('a, b\nc')).toEqual(['a', 'b', 'c'])
  })

  it('parses expected concepts and red flags from editor text', () => {
    expect(
      parseExpectedConcepts('c1 | Closures | 2 | LIFO', (label) => `About ${label}`),
    ).toEqual([
      {
        id: 'c1',
        label: 'Closures',
        weight: 2,
        description: 'LIFO',
      },
    ])
    expect(parseRedFlags('rf1 | Paste | high')[0]).toMatchObject({
      id: 'rf1',
      severity: 'high',
    })
    expect(parseRedFlags('late | Late answer')[0]?.severity).toBe('medium')
  })

  it('normalizes empty editor input to defaults', () => {
    expect(normalizeInitialValue()).toMatchObject({
      role: 'frontend intern',
      difficulty: 'medium',
      minimumPassScore: 2.5,
      metadata: {},
    })
    expect(
      normalizeInitialValue({
        questionText: 'What is CAP?',
        category: 'Backend',
        metadata: { tier: 1 },
      }),
    ).toMatchObject({
      category: 'Backend',
      metadata: { tier: 1 },
    })
  })
})
