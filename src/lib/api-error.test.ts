import { describe, expect, it } from 'vitest'

import {
  ApiError,
  QuestionInUseError,
  getDeleteQuestionErrorTitle,
  getErrorMessage,
  isConflictError,
} from '@/lib/api-error'

describe('getErrorMessage', () => {
  it('returns empty string for null and non-Error values', () => {
    expect(getErrorMessage(null)).toBe('')
    expect(getErrorMessage(undefined)).toBe('')
    expect(getErrorMessage('network failed')).toBe('')
  })

  it('returns Error.message when present', () => {
    expect(getErrorMessage(new Error('Network failed'))).toBe('Network failed')
  })

  it('returns fallback only for Error with empty message', () => {
    expect(getErrorMessage(new Error('   '))).toBe('')
    expect(getErrorMessage(new Error(''), 'Fallback copy')).toBe('Fallback copy')
  })
})

describe('getDeleteQuestionErrorTitle', () => {
  it('uses in-use title for conflict errors', () => {
    expect(
      getDeleteQuestionErrorTitle(
        new QuestionInUseError('Question is in use'),
        'Delete failed',
        'Cannot delete',
      ),
    ).toBe('Cannot delete')
  })

  it('uses default title for other errors', () => {
    expect(
      getDeleteQuestionErrorTitle(new Error('Server error'), 'Delete failed', 'Cannot delete'),
    ).toBe('Delete failed')
  })
})

describe('isConflictError', () => {
  it('detects QuestionInUseError and ApiError 409', () => {
    expect(isConflictError(new QuestionInUseError('in use'))).toBe(true)
    expect(isConflictError(new ApiError(409, 'Conflict'))).toBe(true)
    expect(isConflictError(new ApiError(500, 'Server error'))).toBe(false)
    expect(isConflictError(new Error('other'))).toBe(false)
  })
})

describe('ApiError', () => {
  it('uses provided code and params without re-parsing body', () => {
    const error = new ApiError(
      400,
      'Validation failed',
      '/questions',
      JSON.stringify({ code: 'OTHER_CODE', params: { field: 'ignored' } }),
      'VALIDATION_ERROR',
      { errors: ['questionText is required'] },
    )

    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.params).toEqual({ errors: ['questionText is required'] })
  })

  it('parses body once when code and params are omitted', () => {
    const error = new ApiError(
      400,
      'Validation failed',
      '/questions',
      JSON.stringify({
        code: 'VALIDATION_ERROR',
        params: { errors: ['questionText is required'] },
      }),
    )

    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.params).toEqual({ errors: ['questionText is required'] })
  })
})
