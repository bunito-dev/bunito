import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { styleText } from 'node:util';

export type PackageInfo = {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  engines?: {
    bun?: string;
  };
};

const ROOT_PATH = resolve(import.meta.dir, '..');

const PKG_NAME_PREFIX = '@bunito';
const PKG_DEP_VERSION_PREFIX = 'workspace:';
const PKG_FILE = 'package.json';
const PKG_PATH = join(ROOT_PATH, 'packages');

class PkgSummary {
  private readonly changes: string[] = [];

  constructor(private readonly name: string) {}

  addChange(title: string, version: string): void {
    this.changes.push(
      styleText(
        'italic',
        `  ${styleText('gray', title)} → ${styleText('green', version)}`,
      ),
    );
  }

  hasChanges(): boolean {
    return !!this.changes.length;
  }

  print(): void {
    const changed = !!this.changes.length;

    const name = styleText(changed ? [] : ['white'], this.name);
    const status = styleText(
      changed ? 'greenBright' : 'gray',
      changed ? 'UPDATED' : 'SKIPPED',
    );

    console.log(`${name} ${status}`);

    for (const change of this.changes) {
      console.log(change);
    }
  }
}

const {
  version: rootPkgVersion,
  engines: { bun: rootBunVersion = `>=${Bun.version}` } = {},
} = (await Bun.file(join(ROOT_PATH, PKG_FILE)).json()) as PackageInfo;

const pkgDepVersion = `${PKG_DEP_VERSION_PREFIX}${rootPkgVersion}`;

const pkgDirNames = await readdir(PKG_PATH);

for (const pkgDirName of pkgDirNames) {
  const pkgFile = Bun.file(join(PKG_PATH, pkgDirName, PKG_FILE));

  if (!(await pkgFile.exists())) {
    continue;
  }

  const pkgInfo = (await pkgFile.json()) as PackageInfo;

  if (!pkgInfo.name.startsWith(PKG_NAME_PREFIX)) {
    continue;
  }

  const pkgSummary = new PkgSummary(pkgInfo.name);

  if (pkgInfo.version !== rootPkgVersion) {
    pkgInfo.version = rootPkgVersion;
    pkgSummary.addChange('version', rootPkgVersion);
  }

  if (pkgInfo?.engines?.bun !== rootBunVersion) {
    pkgInfo.engines = {
      bun: rootBunVersion,
    };
    pkgSummary.addChange('bun engine version', rootBunVersion);
  }

  if (pkgInfo.dependencies) {
    const dependencies = Object.entries(pkgInfo.dependencies);

    for (const [name, version] of dependencies) {
      if (name.startsWith(PKG_NAME_PREFIX) && version !== pkgDepVersion) {
        pkgInfo.dependencies[name] = pkgDepVersion;
        pkgSummary.addChange(`${name} version`, pkgDepVersion);
      }
    }
  }

  if (pkgSummary.hasChanges()) {
    await pkgFile.write(JSON.stringify(pkgInfo, null, 2));
  }

  pkgSummary.print();
}
