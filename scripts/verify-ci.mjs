import { spawnSync } from 'node:child_process'

const steps = [
  { name: 'OpenAPI types', command: 'npm run openapi:generate' },
  { name: 'OpenAPI drift check', command: 'git diff --exit-code -- src/lib/api-types.ts' },
  { name: 'Lint + i18n', command: 'npm run lint:ci' },
  { name: 'Unit tests', command: 'npm run test' },
  { name: 'Production build', command: 'npm run build' },
]

function runStep(step) {
  console.log(`\n==> ${step.name}`)
  const result = spawnSync(step.command, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

console.log('Running frontend CI checks locally...')
for (const step of steps) {
  runStep(step)
}

console.log('\nAll frontend CI checks passed.')
console.log(
  'Optional E2E (requires frontend + mock API or real backend on :3000): npm run test:e2e:fast',
)
