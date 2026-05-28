import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SOURCE_LOCALE = 'en'
const TARGET_LOCALES = ['be', 'ru', 'pl']
const MODULE_ORDER = readJson(path.join(ROOT, 'messages', 'module-order.json'))

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function loadLocaleMessages(locale) {
  const localeDir = path.join(ROOT, 'messages', locale)
  const hasModules = fs.existsSync(localeDir)

  if (hasModules) {
    const merged = {}

    for (const moduleName of MODULE_ORDER) {
      const modulePath = path.join(localeDir, `${moduleName}.json`)
      if (!fs.existsSync(modulePath)) {
        throw new Error(
          `Locale '${locale}' is missing module file: messages/${locale}/${moduleName}.json`,
        )
      }
      Object.assign(merged, readJson(modulePath))
    }

    return merged
  }

  const legacyPath = path.join(ROOT, 'messages', `${locale}.json`)
  if (!fs.existsSync(legacyPath)) {
    throw new Error(
      `Locale '${locale}' has neither modules nor legacy file messages/${locale}.json`,
    )
  }
  return readJson(legacyPath)
}

function valueKind(value) {
  if (Array.isArray(value)) {
    return 'array'
  }
  return value === null ? 'null' : typeof value
}

function walkParity(source, target, keyPath, issues) {
  const sourceType = valueKind(source)
  const targetType = valueKind(target)

  if (sourceType !== targetType) {
    issues.typeMismatches.push({
      path: keyPath || '(root)',
      expected: sourceType,
      actual: targetType,
    })
    return
  }

  if (sourceType !== 'object') {
    return
  }

  const sourceKeys = Object.keys(source)
  const targetKeys = Object.keys(target)

  for (const key of sourceKeys) {
    if (!(key in target)) {
      issues.missing.push(keyPath ? `${keyPath}.${key}` : key)
      continue
    }
    walkParity(
      source[key],
      target[key],
      keyPath ? `${keyPath}.${key}` : key,
      issues,
    )
  }

  for (const key of targetKeys) {
    if (!(key in source)) {
      issues.extra.push(keyPath ? `${keyPath}.${key}` : key)
    }
  }
}

function printIssues(locale, issues) {
  const total =
    issues.missing.length + issues.extra.length + issues.typeMismatches.length

  if (total === 0) {
    console.log(`✅ ${locale}: parity OK`)
    return 0
  }

  console.log(`\n❌ ${locale}: parity issues found`)

  if (issues.missing.length > 0) {
    console.log(`  Missing keys (${issues.missing.length}):`)
    for (const key of issues.missing) {
      console.log(`    - ${key}`)
    }
  }

  if (issues.extra.length > 0) {
    console.log(`  Extra keys (${issues.extra.length}):`)
    for (const key of issues.extra) {
      console.log(`    - ${key}`)
    }
  }

  if (issues.typeMismatches.length > 0) {
    console.log(`  Type mismatches (${issues.typeMismatches.length}):`)
    for (const mismatch of issues.typeMismatches) {
      console.log(
        `    - ${mismatch.path}: expected '${mismatch.expected}', got '${mismatch.actual}'`,
      )
    }
  }

  return total
}

function main() {
  const sourceMessages = loadLocaleMessages(SOURCE_LOCALE)
  let failures = 0

  console.log(`Checking i18n key parity against source locale '${SOURCE_LOCALE}'...`)

  for (const locale of TARGET_LOCALES) {
    const localeMessages = loadLocaleMessages(locale)
    const issues = {
      missing: [],
      extra: [],
      typeMismatches: [],
    }

    walkParity(sourceMessages, localeMessages, '', issues)
    failures += printIssues(locale, issues)
  }

  if (failures > 0) {
    console.log('\nParity check failed.')
    process.exit(1)
  }

  console.log('\nAll locale parity checks passed.')
}

main()
