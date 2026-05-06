import { basename, dirname, join, sep } from 'node:path';
import type { CLI } from '../cli';
import { Exception, PKG_FILE_NAME } from '../common';
import type { Template } from '../templates';
import { ProjectTemplate, renderTemplate } from '../templates';
import {
  PROJECT_DIRS,
  PROJECT_FILES,
  PROJECT_PKG_DEPT,
  PROJECT_PKG_SCHEMA,
} from './constants';
import type { ProjectApp, ProjectSettings } from './types';

export class Project {
  private readonly state: {
    settings?: ProjectSettings;
  } = {};

  constructor(private readonly cli: CLI) {}

  get settings(): ProjectSettings {
    const { settings } = this.state;

    if (!settings) {
      throw new Exception('Project settings not loaded');
    }

    return settings;
  }

  async load(): Promise<void> {
    const {
      fs,
      settings: { cwd },
    } = this.cli;

    const paths = cwd.split(sep);

    let name: string | undefined;
    let path: string | undefined;

    while (paths.length > 1) {
      path = paths.join(sep);

      const pkgFile = fs.getFile(path, PKG_FILE_NAME);

      if (await pkgFile.exists()) {
        try {
          const pkg = PROJECT_PKG_SCHEMA.parse(await pkgFile.json());

          if (pkg.dependencies[PROJECT_PKG_DEPT]) {
            name = pkg.name;
            break;
          }
        } catch {
          throw new Exception(`Invalid project ${PKG_FILE_NAME}: ${path}`);
        }
      }

      paths.pop();

      path = undefined;
    }

    name ??= basename(cwd ?? path);

    if (path) {
      const entry = join(path, PROJECT_DIRS.src, PROJECT_FILES.main);
      const entryStats = await fs.getStats(entry);

      if (entryStats?.isFile()) {
        this.state.settings = {
          mode: 'standard',
          name,
          path,
          entry,
        };
        return;
      }

      const appsPath = join(path, PROJECT_DIRS.apps);
      const appNames = await fs.readDir(appsPath);

      if (appNames) {
        const apps: [string, ProjectApp][] = [];

        for (const name of appNames) {
          const path = join(appsPath, name);
          const entry = join(path, PROJECT_DIRS.src, PROJECT_FILES.main);
          const entryStats = await fs.getStats(entry);

          if (entryStats?.isFile()) {
            apps.push([name, { path, entry }]);
          }
        }

        if (apps.length) {
          this.state.settings = {
            mode: 'monorepo',
            path,
            name,
            apps: Object.fromEntries(apps),
          };
          return;
        }
      }
    }

    path ??= cwd;

    this.state.settings = {
      mode: 'unknown',
      name,
      path,
    };
  }

  async create(name: string, apps: string[]): Promise<string[]> {
    const { bunVersion, pkgVersion } = this.cli.settings;

    return await this.renderTemplate(ProjectTemplate, {
      name,
      pkgVersion,
      bunVersion,
      apps: apps.length ? apps : undefined,
    })();
  }

  renderTemplate<ITemplate extends Template>(
    template: ITemplate,
    ...args: Parameters<ITemplate>
  ): (pathOrAlias?: 'cwd' | (string & {}), ...paths: string[]) => Promise<string[]> {
    const files = renderTemplate(template, ...args);

    return async (pathOrAlias, ...paths) => {
      let basePath: string;

      const {
        fs,
        settings: { cwd },
      } = this.cli;

      switch (pathOrAlias) {
        case 'cwd':
          basePath = join(cwd, ...paths);
          break;

        case undefined:
          basePath = join(this.settings.path, ...paths);
          break;

        default:
          basePath = join(this.settings.path, pathOrAlias, ...paths);
          break;
      }

      const names = Object.keys(files);

      for (const name of names) {
        if (await fs.getStats(basePath, name)) {
          throw new Exception(`File ${name} already exists`);
        }
      }

      for (const [path, content] of Object.entries(files)) {
        const filePath = join(basePath, path);

        await fs.ensurePath(dirname(filePath));
        await fs.getFile(filePath).write(content);
      }

      return names;
    };
  }
}
