import { describe, expect, it } from 'vitest';

import type { Question } from '@/lib/api';

import { filterQuestions } from './filter-questions';

function makeQuestion(overrides: Partial<Question>): Question {
  return {
    id: 'q-default',
    outputLanguage: 'en',
    questionText: 'Default question',
    followUpQuestions: [],
    expectedConcepts: [],
    redFlags: [],
    difficulty: 'medium',
    weight: 1,
    minimumPassScore: 60,
    tags: [],
    metadata: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('filterQuestions', () => {
  const questions: Question[] = [
    makeQuestion({
      id: 'q1',
      difficulty: 'easy',
      questionText: 'Explain closures in JavaScript',
      role: 'Frontend Engineer',
      category: 'JavaScript',
      tags: ['js', 'closures'],
      expectedConcepts: [{ id: 'c1', label: 'Scope', weight: 1, description: 'scope basics' }],
      redFlags: [{ id: 'r1', label: 'Memorized answer', severity: 'low' }],
    }),
    makeQuestion({
      id: 'q2',
      difficulty: 'hard',
      questionText: 'Design resilient event-driven architecture',
      role: 'Backend Engineer',
      category: 'System Design',
      tags: ['architecture'],
    }),
  ];

  it('returns all questions when query is empty and difficulty is all', () => {
    const result = filterQuestions({
      questions,
      query: '',
      difficulty: 'all',
    });

    expect(result).toHaveLength(2);
  });

  it('filters by difficulty', () => {
    const result = filterQuestions({
      questions,
      query: '',
      difficulty: 'easy',
    });

    expect(result.map((item) => item.id)).toEqual(['q1']);
  });

  it('filters by case-insensitive query across searchable fields', () => {
    const result = filterQuestions({
      questions,
      query: 'sCoPe',
      difficulty: 'all',
    });

    expect(result.map((item) => item.id)).toEqual(['q1']);
  });

  it('applies query and difficulty together', () => {
    const result = filterQuestions({
      questions,
      query: 'engineer',
      difficulty: 'hard',
    });

    expect(result.map((item) => item.id)).toEqual(['q2']);
  });
});
