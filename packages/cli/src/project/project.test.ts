import { describe, expect, it } from 'bun:test';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Project } from './project';

describe('Project', () => {
  it('reads apps from a bunito project', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));

    await Bun.write(join(dir, 'package.json'), JSON.stringify({ name: 'example' }));
    await Bun.write(
      join(dir, 'bunito.json'),
      JSON.stringify({
        apps: {
          api: {
            entry: 'apps/api.ts',
            envs: {
              PORT: '3000',
            },
          },
          admin: {
            entry: 'apps/admin.ts',
          },
        },
      }),
    );

    const project = await Project.read(dir);

    expect(project).toBeInstanceOf(Project);
    expect(
      project?.getApps().map(({ name, entry, envs }) => ({ name, entry, envs })),
    ).toEqual([
      {
        name: 'api',
        entry: join(dir, 'apps/api.ts'),
        envs: {
          PORT: '3000',
        },
      },
      {
        name: 'admin',
        entry: join(dir, 'apps/admin.ts'),
        envs: undefined,
      },
    ]);
    expect(project?.getApps(new Set(['admin'])).map(({ name }) => name)).toEqual([
      'admin',
    ]);
  });

  it('returns undefined for directories without project metadata', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));

    const missingPackage = await Project.read(dir);

    await Bun.write(join(dir, 'package.json'), JSON.stringify({ name: 'example' }));

    const missingConfig = await Project.read(dir);

    expect(missingPackage).toBeUndefined();
    expect(missingConfig).toBeUndefined();
  });

  it('rejects project configs without apps', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));

    await Bun.write(join(dir, 'package.json'), JSON.stringify({ name: 'example' }));
    await Bun.write(join(dir, 'bunito.json'), JSON.stringify({ apps: null }));

    try {
      await Project.read(dir);
      throw new Error('Expected Project.read to reject invalid app metadata');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Project config must contain apps');
    }
  });
});
