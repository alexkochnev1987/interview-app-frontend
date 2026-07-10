import { describe, expect, it, vi } from 'vitest'

import { runPostDeleteInterviewSuccess } from '@/lib/interview-delete-flow'

describe('runPostDeleteInterviewSuccess', () => {
  it('closes confirm dialog and navigates to dashboard with refresh', () => {
    const closeConfirm = vi.fn()
    const push = vi.fn()
    const refresh = vi.fn()

    runPostDeleteInterviewSuccess({ closeConfirm, push, refresh })

    expect(closeConfirm).toHaveBeenCalledOnce()
    expect(push).toHaveBeenCalledWith('/')
    expect(refresh).toHaveBeenCalledOnce()
  })
})
