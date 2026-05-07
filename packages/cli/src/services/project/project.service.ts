import { basename, dirname, join, relative, sep } from 'node:path';
import { Exception } from '#common';
import type { Context } from '#context';
import type { Template } from '#templates';
import { ProjectTemplate, renderTemplate } from '#templates';
import {
  PROJECT_APPS_DIR,
  PROJECT_ENTRY_FILE,
  PROJECT_ENVS_FILE,
  PROJECT_LIBS_DIR,
  PROJECT_PKG_DEPT,
} from './constants';
import type { ProjectApp, ProjectSettings } from './types';

export class ProjectService {
  private settingsLoaded: ProjectSettings | undefined;

  constructor(
    private readonly context: Context,
    settings?: ProjectSettings,
  ) {
    this.settingsLoaded = settings;
  }

  get settings(): ProjectSettings {
    if (!this.settingsLoaded) {
      throw new Exception('Project settings not loaded');
    }

    return this.settingsLoaded;
  }

  async loadSettings(): Promise<void> {
    const {
      fs,
      settings: { cwd },
    } = this.context;

    const paths = cwd.split(sep);

    let name: string | undefined;
    let path: string | undefined;

    while (paths.length > 1) {
      path = paths.join(sep);

      const pkgInfo = await fs.readPkgInfo(path);

      if (pkgInfo?.dependencies[PROJECT_PKG_DEPT]) {
        name = pkgInfo.name;
        break;
      }

      paths.pop();

      path = undefined;
    }

    name ??= basename(cwd ?? path);

    if (path) {
      const entryFile = fs.getFile(path, PROJECT_ENTRY_FILE);
      const entryStats = await entryFile.tryStat();
      const envsFile = fs.getFile(path, PROJECT_ENVS_FILE);
      const envsStats = await envsFile.tryStat();

      if (entryStats) {
        if (!entryStats.isFile()) {
          throw new Exception(`Project ${PROJECT_ENTRY_FILE} is not a file`);
        }

        this.settingsLoaded = {
          mode: 'standard',
          name,
          path,
          entry: relative(path, entryFile.name),
          envs: envsStats?.isFile() ? relative(path, envsFile.name) : undefined,
        };
        return;
      }

      const appDirs = await fs.readDir(path, PROJECT_APPS_DIR);

      if (appDirs) {
        const apps: [string, ProjectApp][] = [];

        for (const appDir of appDirs) {
          const entryFile = fs.getFile(appDir.name, PROJECT_ENTRY_FILE);
          const entryStats = await entryFile.tryStat();
          const envsFile = fs.getFile(appDir.name, PROJECT_ENVS_FILE);
          const envsStats = await envsFile.tryStat();

          if (entryStats?.isFile()) {
            const name = basename(appDir.name);

            apps.push([
              name,
              {
                name,
                path: relative(path, appDir.name),
                entry: relative(path, entryFile.name),
                envs: envsStats?.isFile() ? relative(path, envsFile.name) : undefined,
              },
            ]);
          }
        }

        let libs: Set<string> | undefined;
        const libsDirs = await fs.readDir(path, PROJECT_LIBS_DIR);

        if (libsDirs) {
          libs = new Set(libsDirs.map((dir) => basename(dir.name)));
        }

        this.settingsLoaded = {
          mode: 'monorepo',
          path,
          name,
          apps: new Map(apps),
          libs,
        };
        return;
      }
    }

    path ??= cwd;

    this.settingsLoaded = {
      mode: 'unknown',
      name,
      path,
    };
  }

  async create(name: string, apps: string[]): Promise<string[]> {
    const { bunVersion, pkgVersion } = this.context.settings;

    return await this.renderTemplate(ProjectTemplate, {
      name,
      pkgVersion,
      bunVersion,
      apps,
    })();
  }

  getApps(names: Set<string> | undefined): ProjectApp[] {
    switch (this.settings.mode) {
      case 'unknown':
        throw new Exception('Project is not initialized');

      case 'standard': {
        if (names) {
          throw new Exception('Supported only in monorepo');
        }

        const { name, path, envs, entry } = this.settings;

        return [
          {
            name,
            path,
            envs,
            entry,
          },
        ];
      }

      case 'monorepo': {
        const { apps } = this.settings;

        if (apps.size === 0) {
          throw new Exception('No apps found');
        }

        if (!names) {
          return Array.from(apps.values());
        }

        const result: ProjectApp[] = [];

        for (const name of names) {
          const app = apps.get(name);

          if (!app) {
            throw new Exception(`App ${name} not found`);
          }

          result.push(app);
        }

        return result;
      }
    }
  }

  renderTemplate<ITemplate extends Template>(
    template: ITemplate,
    ...args: Parameters<ITemplate>
  ): (...paths: string[]) => Promise<string[]> {
    const rendered = renderTemplate(template, ...args);

    return async (...paths) => {
      const { fs } = this.context;

      const contentFiles = Object.entries(rendered).map(([key, content]) => {
        const path = join(...paths, key);

        return {
          content,
          path,
          file: fs.getFile(this.settings.path, path),
        };
      });

      for (const { file, path } of contentFiles) {
        const fileStats = await file.tryStat();

        if (fileStats?.isFile()) {
          throw new Exception(`File ${path} already exists`);
        }

        if (fileStats?.isDirectory()) {
          throw new Exception(`${path} is a directory`);
        }
      }

      const result: string[] = [];

      for (const { path, file, content } of contentFiles) {
        await fs.ensurePath(dirname(file.name));
        await file.write(content);

        result.push(path);
      }

      return result;
    };
  }
}
