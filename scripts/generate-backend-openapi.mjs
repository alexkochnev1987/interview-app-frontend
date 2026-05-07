import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

function runNpmScript(scriptName, cwd) {
  return new Promise((resolvePromise, rejectPromise) => {
    const isWindows = process.platform === 'win32';

    const child = isWindows
      ? spawn('cmd.exe', ['/d', '/s', '/c', `npm run ${scriptName}`], {
          cwd,
          stdio: 'inherit',
          shell: false,
          windowsVerbatimArguments: true,
        })
      : spawn('npm', ['run', scriptName], {
          cwd,
          stdio: 'inherit',
          shell: false,
        });

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

  await runNpmScript('openapi:generate', backendCwd);
}

void main();
