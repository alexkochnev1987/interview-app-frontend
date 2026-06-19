import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const dir = '.next-dev/dev/server'
const files = fs.readdirSync(dir).filter((f) => f.startsWith('_rsc_messages_') && f.endsWith('_json.js'))

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8')
  const module = { exports: {} }
  try {
    vm.runInNewContext(content, { module, exports: module.exports })
    if (!module.exports?.toast && !module.exports?.common && !module.exports?.login) {
      // top-level namespace varies
    }
  } catch (error) {
    console.log('FAIL', file, error.message)
  }
}

console.log('vm-checked', files.length, 'files')
