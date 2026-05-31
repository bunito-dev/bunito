import { describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { IOService } from './io.service';

describe('IOService', () => {
  it('resolves cwd options and reads files, directories, and package metadata', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-io-'));
    const service = new IOService(['--cwd', 'workspace'], dir);
    const workspace = join(dir, 'workspace');

    await mkdir(join(workspace, 'apps'), { recursive: true });
    await Bun.write(
      join(workspace, 'package.json'),
      JSON.stringify({
        name: 'demo',
        dependencies: {
          '@bunito/bunito': 'workspace:*',
        },
      }),
    );

    const file = service.getFile(workspace, 'package.json');
    const created = service.getFile(workspace, 'created.txt');
    const pkg = await service.readPkgInfo(workspace);

    await created.write('created');
    const dirs = await service.readDir(workspace);

    expect(service.cwd).toBe(workspace);
    expect(file.name).toBe(join(workspace, 'package.json'));
    expect(await file.tryStat()).toBeDefined();
    expect(await file.tryJSON()).toMatchObject({ name: 'demo' });
    expect(await created.text()).toBe('created');
    expect(dirs?.map((entry) => entry.name).sort()).toEqual([
      join(workspace, 'apps'),
      join(workspace, 'created.txt'),
      join(workspace, 'package.json'),
    ]);
    expect(pkg).toMatchObject({
      name: 'demo',
      dependencies: {
        '@bunito/bunito': 'workspace:*',
      },
    });
  });

  it('does not write in readonly mode', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-io-'));
    const service = new IOService(['--readonly'], dir);
    const file = service.getFile(dir, 'file.txt');

    const bytes = await file.write('ignored');

    expect(service.readonly).toBeTrue();
    expect(bytes).toBe(0);
    expect(await file.tryStat()).toBeUndefined();
  });

  it('ignores missing, invalid, or directory package files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-io-'));
    const service = new IOService([], dir);

    expect(await service.readPkgInfo(dir)).toBeUndefined();

    await mkdir(join(dir, 'package.json'));

    expect(await service.readPkgInfo(dir)).toBeUndefined();

    const invalidJSON = await mkdtemp(join(tmpdir(), 'bunito-io-'));
    await Bun.write(join(invalidJSON, 'package.json'), '{');

    expect(await service.readPkgInfo(invalidJSON)).toBeUndefined();

    const invalidSchema = await mkdtemp(join(tmpdir(), 'bunito-io-'));
    await Bun.write(join(invalidSchema, 'package.json'), '{"name": 123}');

    expect(await service.readPkgInfo(invalidSchema)).toBeUndefined();
    expect(await service.readDir(dir, 'missing')).toBeUndefined();
  });

  it('delegates interactive input to the configured prompt', async () => {
    const service = new IOService([], undefined, async (options) => {
      expect(options).toEqual({ message: 'Name' });
      return 'demo';
    });

    expect(await service.readInput({ message: 'Name' })).toBe('demo');
  });
});
