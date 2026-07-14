import { describe, expect, it, vi } from 'vitest'

import { runPostInterviewRemovalSuccess } from '@/lib/interview-removal-flow'

describe('runPostInterviewRemovalSuccess', () => {
  it('closes confirm dialog, invalidates interviews cache, and navigates to dashboard', () => {
    const closeConfirm = vi.fn()
    const push = vi.fn()
    const invalidateInterviews = vi.fn()

    runPostInterviewRemovalSuccess({ closeConfirm, push, invalidateInterviews })

    expect(closeConfirm).toHaveBeenCalledOnce()
    expect(invalidateInterviews).toHaveBeenCalledOnce()
    expect(push).toHaveBeenCalledWith('/')
  })
})
