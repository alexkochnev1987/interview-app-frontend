import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

async function run() {
  const cwd = process.cwd();
  const backendPath = process.env.BACKEND_REPO_PATH ?? '../interview-app-backend';
  const source = resolve(cwd, backendPath, 'openapi', 'openapi.json');
  const destinationDir = resolve(cwd, 'openapi');
  const destination = resolve(destinationDir, 'openapi.json');

  await mkdir(destinationDir, { recursive: true });
  await copyFile(source, destination);
  console.log(`OpenAPI spec synced from ${source} to ${destination}`);
}

void run();
