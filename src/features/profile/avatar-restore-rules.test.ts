import { describe, expect, it } from 'vitest'

import { canRestoreGoogleAvatar } from './avatar-restore-rules'

describe('canRestoreGoogleAvatar', () => {
  it('is false when there is no Google picture on file', () => {
    expect(canRestoreGoogleAvatar({ avatarSource: 'upload', hasGoogleAvatar: false })).toBe(false)
  })

  it('is true when a custom upload is active and a Google picture is on file', () => {
    expect(canRestoreGoogleAvatar({ avatarSource: 'upload', hasGoogleAvatar: true })).toBe(true)
  })

  it('is true when the user has deleted down to initials but a Google picture is on file', () => {
    expect(canRestoreGoogleAvatar({ avatarSource: 'none', hasGoogleAvatar: true })).toBe(true)
  })

  it('is false when the Google picture is already the active source', () => {
    expect(canRestoreGoogleAvatar({ avatarSource: 'google', hasGoogleAvatar: true })).toBe(false)
  })

  it('is false when both fields are undefined', () => {
    expect(canRestoreGoogleAvatar({})).toBe(false)
  })
})
