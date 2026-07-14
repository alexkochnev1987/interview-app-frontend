import fs from 'node:fs'
import { execSync } from 'node:child_process'

const develop = JSON.parse(fs.readFileSync('openapi/openapi.json', 'utf8'))
const feature = JSON.parse(
  execSync('git show origin/feat/interviews-list:openapi/openapi.json', { encoding: 'utf8' }),
)

const listGet = structuredClone(feature.paths['/interviews'].get)
listGet.parameters = [
  ...listGet.parameters,
  ...develop.paths['/interviews'].get.parameters.filter((param) => param.in === 'header'),
]

develop.paths['/interviews'].get = listGet
develop.paths['/interviews/facets'] = feature.paths['/interviews/facets']

const schemaKeys = [
  'InterviewListItemDto',
  'PaginatedInterviewsResponseDto',
  'InterviewFacetCountDto',
  'InterviewFacetsResponseDto',
]

for (const key of schemaKeys) {
  develop.components.schemas[key] = feature.components.schemas[key]
}

fs.writeFileSync('openapi/openapi.json', `${JSON.stringify(develop, null, 2)}\n`)
