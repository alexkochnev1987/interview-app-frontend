import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

function runNpmScript(scriptName, cwd) {
  return new Promise((resolvePromise, rejectPromise) => {
    const npmExecPath = process.env.npm_execpath;
    const child = npmExecPath
      ? spawn(process.execPath, [npmExecPath, 'run', scriptName], {
          cwd,
          stdio: 'inherit',
          shell: false,
          env: process.env,
        })
      : spawn(
          process.platform === 'win32' ? 'cmd.exe' : 'npm',
          process.platform === 'win32'
            ? ['/d', '/s', '/c', `npm run ${scriptName}`]
            : ['run', scriptName],
          {
            cwd,
            stdio: 'inherit',
            shell: false,
            env: process.env,
            windowsVerbatimArguments: process.platform === 'win32',
          },
        );

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(`npm run ${scriptName} exited with code ${code ?? 'unknown'}`));
    });

    child.on('error', rejectPromise);
  });
}

async function main() {
  const backendPath = process.env.BACKEND_REPO_PATH ?? '../interview-app-backend';
  const backendCwd = resolve(process.cwd(), backendPath);
  const backendPackageJson = resolve(backendCwd, 'package.json');

  try {
    await access(backendPackageJson, constants.F_OK);
  } catch {
    console.warn(`[openapi] Backend repo not found at ${backendCwd}; skipping backend OpenAPI generation.`);
    return;
  }

  await runNpmScript('openapi:generate', backendCwd);
}

void main();
