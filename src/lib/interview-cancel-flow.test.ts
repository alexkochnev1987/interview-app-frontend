import { describe, expect, it, vi } from 'vitest'

import { runPostCancelInterviewSuccess } from '@/lib/interview-cancel-flow'

describe('runPostCancelInterviewSuccess', () => {
  it('closes confirm dialog and navigates to dashboard with refresh', () => {
    const closeConfirm = vi.fn()
    const push = vi.fn()
    const refresh = vi.fn()

    runPostCancelInterviewSuccess({ closeConfirm, push, refresh })

    expect(closeConfirm).toHaveBeenCalledOnce()
    expect(push).toHaveBeenCalledWith('/')
    expect(refresh).toHaveBeenCalledOnce()
  })
})
