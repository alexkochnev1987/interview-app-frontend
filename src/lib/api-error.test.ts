import { describe, expect, it } from 'vitest'

import {
  ApiError,
  isForbiddenError,
  isUnauthorizedError,
} from '@/lib/api-error'

describe('api-error', () => {
  it('classifies API errors by status', () => {
    const err = new ApiError(404, 'Not found', '/x')
    expect(err.name).toBe('ApiError')
    expect(err.status).toBe(404)
    expect(isUnauthorizedError(new ApiError(401, 'Unauthorized'))).toBe(true)
    expect(isForbiddenError(new ApiError(403, 'Forbidden'))).toBe(true)
    expect(isUnauthorizedError(err)).toBe(false)
    expect(isForbiddenError(new Error('nope'))).toBe(false)
  })
})
