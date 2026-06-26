import { describe, expect, it } from 'vitest'

import {
  buildQuestionFacetsParams,
  buildQuestionsFetchParams,
  DEFAULT_QUESTIONS_QUERY,
  readQuestionsFromSearchParams,
  resolveQuestionsQueryState,
  toQuestionsSearchParams,
} from '@/lib/questions-query-state'

describe('questions-query-state', () => {
  it('reads filters and pagination from search params', () => {
    const params = new URLSearchParams({
      q: 'react',
      difficulty: 'hard',
      category: 'frontend',
      tags: 'hooks',
      status: 'inactive',
      sortBy: 'popularity',
      sortOrder: 'asc',
      page: '2',
      limit: '50',
      view: 'table',
    })
    params.append('tags', 'typescript')

    expect(readQuestionsFromSearchParams(params)).toMatchObject({
      q: 'react',
      difficulty: 'hard',
      category: 'frontend',
      tags: ['hooks', 'typescript'],
      status: 'inactive',
      sortBy: 'popularity',
      sortOrder: 'asc',
      page: 2,
      limit: 50,
      view: 'table',
    })
  })

  it('truncates q and ignores invalid enum values', () => {
    const params = new URLSearchParams({
      q: 'x'.repeat(250),
      difficulty: 'expert',
      page: '0',
      limit: '500',
    })

    const state = readQuestionsFromSearchParams(params)
    expect(state.q).toHaveLength(200)
    expect(state.difficulty).toBeUndefined()
    expect(state.page).toBe(1)
    expect(state.limit).toBe(DEFAULT_QUESTIONS_QUERY.limit)
  })

  it('builds API params from debounced query state', () => {
    const state = {
      ...DEFAULT_QUESTIONS_QUERY,
      q: 'ignored',
      difficulty: 'easy' as const,
      tags: ['a'],
      page: 3,
      limit: 10,
    }

    expect(buildQuestionsFetchParams(state, 'debounced')).toEqual({
      q: 'debounced',
      difficulty: 'easy',
      category: undefined,
      subcategory: undefined,
      tags: ['a'],
      role: undefined,
      status: 'active',
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      page: 3,
      limit: 10,
    })
    expect(buildQuestionFacetsParams(state, 'debounced')).toEqual({
      q: 'debounced',
      difficulty: 'easy',
      category: undefined,
      subcategory: undefined,
      tags: ['a'],
      role: undefined,
      status: 'active',
    })
  })

  it('locks status and resets card view pagination', () => {
    const params = new URLSearchParams({ page: '3', view: 'cards' })
    expect(
      resolveQuestionsQueryState(params, { lockStatus: 'inactive' }).status,
    ).toBe('inactive')
    expect(resolveQuestionsQueryState(params).page).toBe(1)
  })

  it('converts Next searchParams record to URLSearchParams', () => {
    const params = toQuestionsSearchParams({
      q: 'node',
      tags: ['api', 'auth'],
      page: '2',
    })
    expect(params.get('q')).toBe('node')
    expect(params.getAll('tags')).toEqual(['api', 'auth'])
  })

  it('adds eligibleForInterview when requested', () => {
    const state = DEFAULT_QUESTIONS_QUERY

    expect(
        buildQuestionsFetchParams(state, '', { eligibleForInterview: true }),
    ).toMatchObject({ eligibleForInterview: true, status: 'active' })

    expect(
        buildQuestionFacetsParams(state, '', { eligibleForInterview: true }),
    ).toMatchObject({ eligibleForInterview: true })
  })
})
