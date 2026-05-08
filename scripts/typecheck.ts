import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';

const ROOT_PATH = resolve(import.meta.dir, '..');
const TSC_ARGS = ['tsc', '--noEmit', '--project'];
const WORKSPACE_DIRS = ['packages', 'examples'];
const TSCONFIG_FILE = 'tsconfig.json';

async function hasTsconfig(path: string): Promise<boolean> {
  return Bun.file(join(path, TSCONFIG_FILE)).exists();
}

async function findProjects(): Promise<string[]> {
  const projects: string[] = [];

  for (const workspaceDir of WORKSPACE_DIRS) {
    const workspacePath = join(ROOT_PATH, workspaceDir);
    const entries = await readdir(workspacePath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const projectPath = join(workspacePath, entry.name);

      if (await hasTsconfig(projectPath)) {
        projects.push(projectPath);
      }
    }
  }

  return projects.sort();
}

for (const projectPath of await findProjects()) {
  const projectName = projectPath.replace(`${ROOT_PATH}/`, '');

  console.log(`typecheck ${projectName}`);

  const child = Bun.spawn(['bunx', ...TSC_ARGS, join(projectPath, TSCONFIG_FILE)], {
    cwd: ROOT_PATH,
    stderr: 'inherit',
    stdout: 'inherit',
  });

  const exitCode = await child.exited;

  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}
