import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const LEGACY_FILES = ['en.json', 'be.json', 'ru.json', 'pl.json'].map((file) =>
  path.join(ROOT, 'messages', file),
)

const existingLegacyFiles = LEGACY_FILES.filter((filePath) =>
  fs.existsSync(filePath),
)

if (existingLegacyFiles.length > 0) {
  console.error('❌ Legacy i18n flat files are not allowed:')
  for (const filePath of existingLegacyFiles) {
    console.error(`  - ${path.relative(ROOT, filePath)}`)
  }
  console.error(
    '\nUse modular files only: messages/<locale>/*.json. Remove legacy files before merge.',
  )
  process.exit(1)
}

console.log('✅ Legacy i18n guard: OK (no flat legacy files)')
