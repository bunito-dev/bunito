import { describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Exception } from '../../common';
import type { Context } from '../../context';
import { FSService } from '../fs';
import { ProjectService } from './project-service';

async function createProjectContext(cwd: string, readonly = false): Promise<Context> {
  const context = {
    settings: {
      cwd,
      pkgVersion: 'workspace:*',
      bunVersion: '>=1.3.11',
      readonly,
    },
  } as unknown as Context;

  Object.defineProperty(context, 'fs', {
    value: new FSService(context),
  });

  return context;
}

async function writePackage(dir: string): Promise<void> {
  await Bun.write(
    join(dir, 'package.json'),
    JSON.stringify({
      name: 'demo',
      dependencies: {
        '@bunito/bunito': 'workspace:*',
      },
    }),
  );
}

describe('ProjectService', () => {
  it('detects standard projects with optional env files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    await writePackage(dir);
    await mkdir(join(dir, 'src'), { recursive: true });
    await Bun.write(join(dir, 'src/main.ts'), 'console.log("ok");');
    await Bun.write(join(dir, '.env'), 'PORT=3000');

    const service = new ProjectService(await createProjectContext(dir));
    await service.loadSettings();

    expect(service.settings).toEqual({
      mode: 'standard',
      name: 'demo',
      path: dir,
      entry: 'src/main.ts',
      envs: '.env',
    });
    expect(service.getApps(undefined)).toEqual([
      {
        name: 'demo',
        path: dir,
        entry: 'src/main.ts',
        envs: '.env',
      },
    ]);
  });

  it('detects monorepo apps and libraries', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    await writePackage(dir);
    await mkdir(join(dir, 'apps/api/src'), { recursive: true });
    await mkdir(join(dir, 'apps/empty'), { recursive: true });
    await mkdir(join(dir, 'libs/shared'), { recursive: true });
    await Bun.write(join(dir, 'apps/api/src/main.ts'), 'console.log("api");');
    await Bun.write(join(dir, 'apps/api/.env'), 'PORT=3000');

    const service = new ProjectService(await createProjectContext(join(dir, 'apps/api')));
    await service.loadSettings();

    expect(service.settings.mode).toBe('monorepo');
    expect(service.getApps(undefined)).toEqual([
      {
        name: 'api',
        path: 'apps/api',
        entry: 'apps/api/src/main.ts',
        envs: 'apps/api/.env',
      },
    ]);
    expect(service.getApps(new Set(['api']))).toHaveLength(1);
  });

  it('reports unknown projects and app selection errors', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    const service = new ProjectService(await createProjectContext(dir));

    await service.loadSettings();

    expect(service.settings).toMatchObject({
      mode: 'unknown',
      path: dir,
    });
    expect(() => service.getApps(undefined)).toThrow(
      new Exception('Project is not initialized'),
    );
  });

  it('rejects named apps in standard projects and missing monorepo apps', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    await writePackage(dir);
    await mkdir(join(dir, 'src'), { recursive: true });
    await Bun.write(join(dir, 'src/main.ts'), 'console.log("ok");');

    const standard = new ProjectService(await createProjectContext(dir));
    await standard.loadSettings();

    expect(() => standard.getApps(new Set(['api']))).toThrow(
      new Exception('This command is available only in monorepo projects'),
    );

    const monorepoDir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    await writePackage(monorepoDir);
    await mkdir(join(monorepoDir, 'apps/api/src'), { recursive: true });
    await Bun.write(join(monorepoDir, 'apps/api/src/main.ts'), 'console.log("api");');

    const monorepo = new ProjectService(await createProjectContext(monorepoDir));
    await monorepo.loadSettings();

    expect(() => monorepo.getApps(new Set(['admin']))).toThrow(
      new Exception('App "admin" was not found'),
    );
  });

  it('creates projects and protects existing template paths', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    const service = new ProjectService(await createProjectContext(dir));

    await service.loadSettings();

    const files = await service.create('demo', ['api']);

    expect(files).toContain('package.json');
    expect(await Bun.file(join(dir, 'apps/api/src/app.module.ts')).exists()).toBeTrue();
    expect(await Bun.file(join(dir, 'apps/api/src/index.ts')).exists()).toBeTrue();

    try {
      await service.create('demo', ['api']);
      throw new Error('Expected duplicate template paths to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(Exception);
      expect((error as Error).message).toBe(
        'File "apps/api/src/app.module.ts" already exists',
      );
    }
  });
});
