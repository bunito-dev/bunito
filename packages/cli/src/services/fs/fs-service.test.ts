import { describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Context } from '../../context';
import { FSService } from './fs-service';

function createContext(readonly = false): Context {
  return {
    settings: {
      readonly,
    },
  } as unknown as Context;
}

describe('FSService', () => {
  it('reads files, directories, and package metadata', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-fs-'));
    const service = new FSService(createContext());

    await mkdir(join(dir, 'apps'));
    await Bun.write(
      join(dir, 'package.json'),
      JSON.stringify({
        name: 'demo',
        dependencies: {
          '@bunito/bunito': 'workspace:*',
        },
      }),
    );

    const file = service.getFile(dir, 'package.json');
    const created = service.getFile(dir, 'created.txt');
    const dirs = await service.readDir(dir);
    const pkg = await service.readPkgInfo(dir);

    await created.write('created');
    await service.ensurePath(dir, 'nested');

    expect(file.name).toBe(join(dir, 'package.json'));
    expect(await file.tryStat()).toBeDefined();
    expect(await file.tryJSON()).toMatchObject({ name: 'demo' });
    expect(await created.text()).toBe('created');
    expect(dirs?.map((entry) => entry.name).sort()).toEqual([
      join(dir, 'apps'),
      join(dir, 'package.json'),
    ]);
    expect(pkg).toMatchObject({
      name: 'demo',
      dependencies: {
        '@bunito/bunito': 'workspace:*',
      },
    });
    expect(await service.getFile(dir, 'nested').tryStat()).toBeDefined();
    expect(await service.readDir(dir, 'missing')).toBeUndefined();
  });

  it('does not write or create paths in readonly mode', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-fs-'));
    const service = new FSService(createContext(true));
    const file = service.getFile(dir, 'file.txt');

    const bytes = await file.write('ignored');
    await service.ensurePath(dir, 'nested');

    expect(bytes).toBe(0);
    expect(await file.tryStat()).toBeUndefined();
    expect(await service.getFile(dir, 'nested').tryStat()).toBeUndefined();
  });

  it('copies content recursively', async () => {
    const source = await mkdtemp(join(tmpdir(), 'bunito-fs-source-'));
    const target = await mkdtemp(join(tmpdir(), 'bunito-fs-target-'));
    const service = new FSService(createContext());

    await mkdir(join(source, 'nested'), { recursive: true });
    await Bun.write(join(source, 'nested/file.txt'), 'copied');

    await service.copyContent(source, join(target, 'copy'));

    expect(await Bun.file(join(target, 'copy/nested/file.txt')).text()).toBe('copied');
  });

  it('ignores missing, invalid, or directory package files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-fs-'));
    const service = new FSService(createContext());

    expect(await service.readPkgInfo(dir)).toBeUndefined();

    await mkdir(join(dir, 'package.json'));

    expect(await service.readPkgInfo(dir)).toBeUndefined();

    const invalidJSON = await mkdtemp(join(tmpdir(), 'bunito-fs-'));
    await Bun.write(join(invalidJSON, 'package.json'), '{');

    expect(await service.readPkgInfo(invalidJSON)).toBeUndefined();

    const invalidSchema = await mkdtemp(join(tmpdir(), 'bunito-fs-'));
    await Bun.write(join(invalidSchema, 'package.json'), '{"name": 123}');

    expect(await service.readPkgInfo(invalidSchema)).toBeUndefined();
  });
});
