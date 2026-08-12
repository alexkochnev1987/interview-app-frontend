/** System config key for the org-wide Herman (recruiter assistant) toggle. */
export const RECRUITER_ASSISTANT_ENABLED_KEY = 'RECRUITER_ASSISTANT_ENABLED' as const

export type RecruiterAssistantLockRole = 'super_admin' | 'admin' | 'hr' | 'candidate'

/** Per-role Herman locks — mirrors backend `RECRUITER_ASSISTANT_ENABLED_${ROLE}` env keys. */
export const RECRUITER_ASSISTANT_ROLE_LOCKS: ReadonlyArray<{
  role: RecruiterAssistantLockRole
  key: `RECRUITER_ASSISTANT_ENABLED_${Uppercase<RecruiterAssistantLockRole>}`
}> = [
  { role: 'super_admin', key: 'RECRUITER_ASSISTANT_ENABLED_SUPER_ADMIN' },
  { role: 'admin', key: 'RECRUITER_ASSISTANT_ENABLED_ADMIN' },
  { role: 'hr', key: 'RECRUITER_ASSISTANT_ENABLED_HR' },
  { role: 'candidate', key: 'RECRUITER_ASSISTANT_ENABLED_CANDIDATE' },
]

export function getRecruiterAssistantRoleConfigKey(role: RecruiterAssistantLockRole): string {
  return `RECRUITER_ASSISTANT_ENABLED_${role.toUpperCase()}`
}

export const RECRUITER_ASSISTANT_ROLE_CONFIG_KEYS = new Set<string>(
  RECRUITER_ASSISTANT_ROLE_LOCKS.map((entry) => entry.key),
)

/** Hidden from the flat table — shown nested under RECRUITER_ASSISTANT_ENABLED. */
export const RECRUITER_ASSISTANT_NESTED_CONFIG_KEYS = RECRUITER_ASSISTANT_ROLE_CONFIG_KEYS

/** Legacy alias kept for public-config fallback only. */
export const DEPRECATED_CONFIG_KEYS = new Set<string>([
  'ENABLE_AI_ASSISTANT',
  'RECRUITER_ASSISTANT_ENABLED_ROLES',
])

export function isRecruiterAssistantConfigKey(key: string): boolean {
  return key === RECRUITER_ASSISTANT_ENABLED_KEY || RECRUITER_ASSISTANT_ROLE_CONFIG_KEYS.has(key)
}

/**
 * Public application configuration — exposed to all authenticated users.
 *
 * Mirrors the shape returned by `GET /api/config/public`.
 * Only boolean/numeric knobs consumed by the frontend are listed;
 * the backend may carry additional keys that the UI does not need.
 */
export interface PublicAppConfig {
  /** Maximum answer recording duration in seconds (default: 240). */
  MAX_ANSWER_DURATION_SECONDS: number
  /** Maximum recording attempts per question (default: 3). */
  MAX_ANSWER_ATTEMPTS_PER_QUESTION: number
  /** Whether Google OAuth sign-in button is shown. */
  ENABLE_GOOGLE_OAUTH: boolean
  /** Whether candidate-feedback share links are available. */
  ENABLE_FEEDBACK_SHARE_LINKS: boolean
  /** Default UI theme mode (system | light | dark). */
  DEFAULT_THEME_MODE: string
  /** Active UI color theme preset (innowise | red | blue | purple). */
  APP_THEME: string
  /** Whether Herman (recruiter AI assistant) is enabled org-wide. */
  RECRUITER_ASSISTANT_ENABLED: boolean
}

/**
 * Hardcoded defaults used when the server snapshot is unavailable.
 * Note: These are intentionally fail-closed (ENABLE_* = false) to ensure a safe fallback.
 */
export const DEFAULT_PUBLIC_APP_CONFIG: PublicAppConfig = {
  MAX_ANSWER_DURATION_SECONDS: 240,
  MAX_ANSWER_ATTEMPTS_PER_QUESTION: 3,
  ENABLE_GOOGLE_OAUTH: false,
  ENABLE_FEEDBACK_SHARE_LINKS: false,
  DEFAULT_THEME_MODE: 'system',
  APP_THEME: 'innowise',
  RECRUITER_ASSISTANT_ENABLED: false,
}

function parseNumber(val: unknown, fallback: number): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val
  if (typeof val === 'string' && val.trim() !== '') {
    const parsed = Number(val)
    if (!Number.isNaN(parsed)) return parsed
  }
  return fallback
}

function parseBoolean(val: unknown, fallback: boolean): boolean {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }
  return fallback
}

function parseString(val: unknown, fallback: string): string {
  if (typeof val === 'string' && val.trim() !== '') return val
  return fallback
}

/**
 * Safely parses and coerces raw API config snapshot objects,
 * ensuring numbers are numbers and booleans are booleans.
 */
export function parsePublicConfig(raw?: Record<string, unknown> | null): PublicAppConfig {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_PUBLIC_APP_CONFIG }
  }

  return {
    MAX_ANSWER_DURATION_SECONDS: parseNumber(
      raw.MAX_ANSWER_DURATION_SECONDS,
      DEFAULT_PUBLIC_APP_CONFIG.MAX_ANSWER_DURATION_SECONDS,
    ),
    MAX_ANSWER_ATTEMPTS_PER_QUESTION: parseNumber(
      raw.MAX_ANSWER_ATTEMPTS_PER_QUESTION,
      DEFAULT_PUBLIC_APP_CONFIG.MAX_ANSWER_ATTEMPTS_PER_QUESTION,
    ),
    ENABLE_GOOGLE_OAUTH: parseBoolean(
      raw.ENABLE_GOOGLE_OAUTH,
      DEFAULT_PUBLIC_APP_CONFIG.ENABLE_GOOGLE_OAUTH,
    ),
    ENABLE_FEEDBACK_SHARE_LINKS: parseBoolean(
      raw.ENABLE_FEEDBACK_SHARE_LINKS,
      DEFAULT_PUBLIC_APP_CONFIG.ENABLE_FEEDBACK_SHARE_LINKS,
    ),
    DEFAULT_THEME_MODE: parseString(
      raw.DEFAULT_THEME_MODE,
      DEFAULT_PUBLIC_APP_CONFIG.DEFAULT_THEME_MODE,
    ),
    APP_THEME: parseString(raw.APP_THEME, DEFAULT_PUBLIC_APP_CONFIG.APP_THEME),
    RECRUITER_ASSISTANT_ENABLED: parseBoolean(
      raw.RECRUITER_ASSISTANT_ENABLED ?? raw.ENABLE_AI_ASSISTANT,
      DEFAULT_PUBLIC_APP_CONFIG.RECRUITER_ASSISTANT_ENABLED,
    ),
  }
}

// ---------------------------------------------------------------------------
// Admin-facing types (super-admin dashboard)
// ---------------------------------------------------------------------------

/** Value type descriptor returned by the config API. */
export type SystemConfigValueType = 'string' | 'number' | 'boolean' | 'enum' | 'json' | 'secret'

/** A single system configuration variable as returned by `GET /api/config`. */
export interface SystemConfigEntry {
  key: string
  value: string
  valueType: SystemConfigValueType
  options?: string[]
  description?: string
  isPublic: boolean
  isSecret: boolean
  isOverridden?: boolean
}

/** Payload for `PUT /api/config/:key`. */
export interface UpdateSystemConfigPayload {
  value: string
  valueType?: SystemConfigValueType
  options?: string[]
  description?: string
  isPublic?: boolean
  isSecret?: boolean
}
