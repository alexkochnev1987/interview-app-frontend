import { copyFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

async function run() {
  const cwd = process.cwd();
  const backendPath = process.env.BACKEND_REPO_PATH ?? '../interview-app-backend';
  const source = resolve(cwd, backendPath, 'openapi', 'openapi.json');
  const destinationDir = resolve(cwd, 'openapi');
  const destination = resolve(destinationDir, 'openapi.json');

  await mkdir(destinationDir, { recursive: true });

  try {
    await access(source, constants.F_OK);
  } catch {
    console.warn(`[openapi] Source spec not found at ${source}; keeping existing ${destination}.`);
    return;
  }

  await copyFile(source, destination);
  console.log(`OpenAPI spec synced from ${source} to ${destination}`);
}

void run();
