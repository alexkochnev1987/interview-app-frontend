export async function mergeLocaleModules({ locale, moduleOrder, loadModule }) {
  const moduleEntries = await Promise.all(
    moduleOrder.map(async (moduleName) => [
      moduleName,
      await loadModule(moduleName),
    ]),
  )

  const modulesByName = new Map(moduleEntries)
  const keyOwners = new Map()
  const merged = {}

  for (const moduleName of moduleOrder) {
    const moduleMessages = modulesByName.get(moduleName)
    if (!moduleMessages) {
      throw new Error(
        `Missing i18n module file: messages/${locale}/${moduleName}.json`,
      )
    }

    for (const key of Object.keys(moduleMessages)) {
      const existingOwner = keyOwners.get(key)
      if (existingOwner && existingOwner !== moduleName) {
        throw new Error(
          `Top-level i18n key collision for locale '${locale}': key '${key}' is defined in both modules '${existingOwner}' and '${moduleName}'.`,
        )
      }
      keyOwners.set(key, moduleName)
    }

    Object.assign(merged, moduleMessages)
  }

  return merged
}
