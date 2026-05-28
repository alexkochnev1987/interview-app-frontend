import moduleOrder from '../../messages/module-order.json'
import { mergeLocaleModules } from './module-loader-core.mjs'

type Messages = Record<string, unknown>

const MODULE_ORDER = moduleOrder as string[]
const localeMessagesCache = new Map<string, Promise<Messages>>()

function isMissingModuleImportError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const code =
    'code' in error && typeof error.code === 'string'
      ? error.code
      : 'cause' in error &&
          error.cause &&
          typeof error.cause === 'object' &&
          'code' in error.cause &&
          typeof error.cause.code === 'string'
        ? error.cause.code
        : ''

  return code === 'ERR_MODULE_NOT_FOUND' || code === 'MODULE_NOT_FOUND'
}

async function loadModule(locale: string, moduleName: string): Promise<Messages> {
  try {
    return (
      await import(`../../messages/${locale}/${moduleName}.json`)
    ).default as Messages
  } catch (error) {
    if (isMissingModuleImportError(error)) {
      throw new Error(`Missing i18n module file: messages/${locale}/${moduleName}.json`)
    }
    throw error
  }
}

async function loadLocaleMessagesUncached(locale: string): Promise<Messages> {
  return (await mergeLocaleModules({
    locale,
    moduleOrder: MODULE_ORDER,
    loadModule: (moduleName: string) => loadModule(locale, moduleName),
  })) as Messages
}

export async function loadLocaleMessages(locale: string): Promise<Messages> {
  const cached = localeMessagesCache.get(locale)
  if (cached) {
    return cached
  }

  const loading = loadLocaleMessagesUncached(locale).catch((error) => {
    localeMessagesCache.delete(locale)
    throw error
  })
  localeMessagesCache.set(locale, loading)
  return loading
}
