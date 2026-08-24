import { describe, expect, it } from 'vitest'

import { DEFAULT_PUBLIC_APP_CONFIG, parsePublicConfig } from './app-config-types'

describe('parsePublicConfig', () => {
  it('returns default config when input is null, undefined, or empty object', () => {
    expect(parsePublicConfig(null)).toEqual(DEFAULT_PUBLIC_APP_CONFIG)
    expect(parsePublicConfig(undefined)).toEqual(DEFAULT_PUBLIC_APP_CONFIG)
    expect(parsePublicConfig({})).toEqual(DEFAULT_PUBLIC_APP_CONFIG)
  })

  it('correctly parses ENABLE_LIVE_TRANSCRIPT and LIVE_TRANSCRIPT_DEFAULT_EXPANDED booleans', () => {
    const parsed = parsePublicConfig({
      ENABLE_LIVE_TRANSCRIPT: false,
      LIVE_TRANSCRIPT_DEFAULT_EXPANDED: false,
    })

    expect(parsed.ENABLE_LIVE_TRANSCRIPT).toBe(false)
    expect(parsed.LIVE_TRANSCRIPT_DEFAULT_EXPANDED).toBe(false)
  })

  it('correctly parses string boolean representations', () => {
    const parsedFalse = parsePublicConfig({
      ENABLE_LIVE_TRANSCRIPT: 'false',
      LIVE_TRANSCRIPT_DEFAULT_EXPANDED: 'false',
    })
    expect(parsedFalse.ENABLE_LIVE_TRANSCRIPT).toBe(false)
    expect(parsedFalse.LIVE_TRANSCRIPT_DEFAULT_EXPANDED).toBe(false)

    const parsedTrue = parsePublicConfig({
      ENABLE_LIVE_TRANSCRIPT: 'true',
      LIVE_TRANSCRIPT_DEFAULT_EXPANDED: 'true',
    })
    expect(parsedTrue.ENABLE_LIVE_TRANSCRIPT).toBe(true)
    expect(parsedTrue.LIVE_TRANSCRIPT_DEFAULT_EXPANDED).toBe(true)
  })

  it('falls back to default values when fields are invalid or missing', () => {
    const parsed = parsePublicConfig({
      ENABLE_LIVE_TRANSCRIPT: 'invalid-value',
      LIVE_TRANSCRIPT_DEFAULT_EXPANDED: null,
    })

    expect(parsed.ENABLE_LIVE_TRANSCRIPT).toBe(DEFAULT_PUBLIC_APP_CONFIG.ENABLE_LIVE_TRANSCRIPT)
    expect(parsed.LIVE_TRANSCRIPT_DEFAULT_EXPANDED).toBe(
      DEFAULT_PUBLIC_APP_CONFIG.LIVE_TRANSCRIPT_DEFAULT_EXPANDED,
    )
  })
})
