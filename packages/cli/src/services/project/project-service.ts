import { basename, dirname, join, sep } from 'node:path';
import { Exception, isKebabCase } from '../../common';
import type { Context } from '../../context';
import type { Template } from '../../templates';
import { renderTemplate } from '../../templates';
import { PROJECT_PKG_DEPT, ROOT_APP_NAME } from './constants';
import type { App, ProjectState } from './types';

export class ProjectService {
  private stateLoaded: ProjectState | undefined;

  constructor(
    private readonly context: Context,
    settings?: ProjectState,
  ) {
    this.stateLoaded = settings;
  }

  get state(): ProjectState {
    if (!this.stateLoaded) {
      throw new Exception('Project state have not been loaded');
    }

    return this.stateLoaded;
  }

  async loadState(): Promise<void> {
    const {
      fs,
      settings: { cwd },
    } = this.context;

    const paths = cwd.split(sep);

    let name: string | undefined;
    let path: string | undefined;
    let initialized: boolean | undefined;

    while (paths.length > 1) {
      path = paths.join(sep);

      const pkgInfo = await fs.readPkgInfo(path);

      if (pkgInfo?.dependencies[PROJECT_PKG_DEPT]) {
        name = pkgInfo.name;
        initialized = true;
        break;
      }

      paths.pop();

      path = undefined;
    }

    path ??= cwd;
    name ??= basename(path);

    this.stateLoaded = {
      name,
      path,
      initialized,
    };

    if (!initialized) {
      return;
    }

    if (await this.appExistsAt(path)) {
      this.stateLoaded.app = true;
    }

    const appDirs = await fs.readDir(path, 'apps');

    if (appDirs) {
      for (const appDir of appDirs) {
        if (!(await this.appExistsAt(appDir.name))) {
          continue;
        }

        this.stateLoaded.apps ??= new Set();
        this.stateLoaded.apps.add(basename(appDir.name));
      }
    }

    const libsDirs = await fs.readDir(path, 'libs');

    if (libsDirs) {
      for (const libDir of libsDirs) {
        const indexStats = await fs.getFile(libDir.name, 'index.ts').tryStat();

        if (!indexStats?.isFile()) {
          continue;
        }

        this.stateLoaded.libs ??= new Set();
        this.stateLoaded.libs.add(basename(libDir.name));
      }
    }
  }

  requireInitialized(): void {
    if (!this.isInitialized()) {
      throw new Exception(['Project is not initialized', this.state.path]);
    }
  }

  isInitialized(): boolean {
    return this.state.initialized ?? false;
  }

  initialize(name: string): void {
    if (!isKebabCase(name)) {
      throw new Exception('Project name must be kebab-case');
    }

    this.state.name = name;
    this.state.app = true;
  }

  addApp(name: string): void {
    if (!isKebabCase(name)) {
      throw new Exception('App name must be kebab-case');
    }

    if (this.hasApp(name)) {
      throw new Exception(`App "${name}" already exists`);
    }

    if (name === ROOT_APP_NAME) {
      this.state.app = true;
    } else {
      this.state.apps ??= new Set();
      this.state.apps.add(name);
    }
  }

  addLib(name: string): void {
    if (!isKebabCase(name)) {
      throw new Exception('Lib name must be kebab-case');
    }

    if (this.hasLib(name)) {
      throw new Exception(`Lib "${name}" already exists`);
    }

    this.state.libs ??= new Set();
    this.state.libs.add(name);
  }

  hasApp(name: string): boolean {
    const { app, apps } = this.state;
    return (name === ROOT_APP_NAME ? app : apps?.has(name)) ?? false;
  }

  hasLib(name: string): boolean {
    return this.state.libs?.has(name) ?? false;
  }

  getApp(): App {
    const { name, app, path } = this.state;

    if (!app) {
      throw new Exception('Main app was not found');
    }

    return {
      name,
      root: true,
      path,
    };
  }

  getApps(onlyNames?: Set<string> | null): App[] {
    const { app, apps, path: rootPath } = this.state;

    if (!app || !apps) {
      throw new Exception('No runnable apps were found');
    }

    let names: string[];

    if (!onlyNames) {
      names = [ROOT_APP_NAME, ...apps];
    } else {
      names = [];

      for (const name of onlyNames) {
        if (!this.hasApp(name)) {
          throw new Exception(`App "${name}" was not found`);
        }
      }

      names.push(...onlyNames);
    }

    return names.map((name) =>
      name === ROOT_APP_NAME
        ? {
            name,
            root: true,
            path: rootPath,
          }
        : {
            name,
            root: false,
            path: join(rootPath, 'apps', name),
          },
    );
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
          file: fs.getFile(this.state.path, path),
        };
      });

      for (const { file, path } of contentFiles) {
        const fileStats = await file.tryStat();

        if (fileStats?.isFile()) {
          throw new Exception(`File "${path}" already exists`);
        }

        if (fileStats?.isDirectory()) {
          throw new Exception(`Path "${path}" is a directory`);
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

  private async appExistsAt(appPath: string): Promise<boolean> {
    const { fs } = this.context;

    const entryFile = fs.getFile(appPath, 'src', 'main.ts');

    const entryStats = await entryFile.tryStat();

    if (!entryStats) {
      return false;
    }

    if (entryStats.isFile()) {
      return true;
    }

    throw new Exception(['Project entry must be a file:', entryFile.name]);
  }
}
