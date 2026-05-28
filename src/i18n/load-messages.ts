import moduleOrder from '../../messages/module-order.json'

type Messages = Record<string, unknown>

const MODULE_ORDER = moduleOrder

type MessageModuleName = string

class MissingI18nModuleError extends Error {
  constructor(locale: string, moduleName: MessageModuleName) {
    super(`Missing i18n module file: messages/${locale}/${moduleName}.json`)
    this.name = 'MissingI18nModuleError'
  }
}

class TopLevelKeyCollisionError extends Error {
  constructor(
    locale: string,
    key: string,
    firstModule: MessageModuleName,
    secondModule: MessageModuleName,
  ) {
    super(
      `Top-level i18n key collision for locale '${locale}': key '${key}' is defined in both modules '${firstModule}' and '${secondModule}'.`,
    )
    this.name = 'TopLevelKeyCollisionError'
  }
}

function isModuleNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const missingPatterns = [
    'Cannot find module',
    'Module not found',
    'Cannot resolve',
  ]

  return missingPatterns.some((pattern) => error.message.includes(pattern))
}

async function importModule(
  locale: string,
  moduleName: MessageModuleName,
): Promise<Messages> {
  try {
    return (
      await import(`../../messages/${locale}/${moduleName}.json`)
    ).default as Messages
  } catch (error) {
    if (isModuleNotFoundError(error)) {
      throw new MissingI18nModuleError(locale, moduleName)
    }
    throw error
  }
}

async function loadMergedModules(locale: string): Promise<Messages> {
  const moduleEntries = await Promise.all(
    MODULE_ORDER.map(async (moduleName) => [
      moduleName,
      await importModule(locale, moduleName),
    ] as const),
  )

  const modulesByName = new Map<MessageModuleName, Messages>(moduleEntries)
  const merged: Messages = {}
  const keyOwners = new Map<string, MessageModuleName>()

  for (const moduleName of MODULE_ORDER) {
    const moduleMessages = modulesByName.get(moduleName)
    if (!moduleMessages) {
      throw new MissingI18nModuleError(locale, moduleName)
    }

    for (const key of Object.keys(moduleMessages)) {
      const existingOwner = keyOwners.get(key)
      if (existingOwner && existingOwner !== moduleName) {
        throw new TopLevelKeyCollisionError(
          locale,
          key,
          existingOwner,
          moduleName,
        )
      }
      keyOwners.set(key, moduleName)
    }

    Object.assign(merged, moduleMessages)
  }

  return merged
}

export async function loadLocaleMessages(locale: string): Promise<Messages> {
  return loadMergedModules(locale)
}
