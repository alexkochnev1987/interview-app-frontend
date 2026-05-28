import fs from 'node:fs/promises'
import path from 'node:path'

import { mergeLocaleModules } from '../src/i18n/module-loader-core.mjs'

const ROOT = process.cwd()
const MESSAGES_DIR = path.join(ROOT, 'messages')
const SOURCE_LOCALE = 'en'
const TARGET_LOCALES = ['be', 'ru', 'pl']

let moduleOrderCache = null

async function readJsonFile(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

async function getModuleOrder() {
  if (moduleOrderCache) {
    return moduleOrderCache
  }
  moduleOrderCache = await readJsonFile(path.join(MESSAGES_DIR, 'module-order.json'))
  return moduleOrderCache
}

async function loadLocaleMessages(locale) {
  const moduleOrder = await getModuleOrder()
  return mergeLocaleModules({
    locale,
    moduleOrder,
    loadModule: async (moduleName) =>
      readJsonFile(path.join(MESSAGES_DIR, locale, `${moduleName}.json`)),
  })
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

async function main() {
  const sourceMessages = await loadLocaleMessages(SOURCE_LOCALE)
  let failures = 0

  console.log(`Checking i18n key parity against source locale '${SOURCE_LOCALE}'...`)

  for (const locale of TARGET_LOCALES) {
    const localeMessages = await loadLocaleMessages(locale)
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

void main()
