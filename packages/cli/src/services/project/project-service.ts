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
    const { app, apps } = this.state;

    if (name === ROOT_APP_NAME) {
      if (app) {
        throw new Exception('Root app already exists');
      }

      this.state.app = true;
      return;
    }

    if (!isKebabCase(name)) {
      throw new Exception('App name must be kebab-case');
    }

    if (apps?.has(name)) {
      throw new Exception(`App "${name}" already exists`);
    }

    this.state.apps ??= new Set();
    this.state.apps.add(name);
  }

  addLib(name: string): void {
    const { libs } = this.state;

    if (!isKebabCase(name)) {
      throw new Exception('Lib name must be kebab-case');
    }

    if (libs?.has(name)) {
      throw new Exception(`Lib "${name}" already exists`);
    }

    this.state.libs ??= new Set();
    this.state.libs.add(name);
  }

  getApps(root: boolean, nameFilter?: Set<string> | null): App[] {
    const { apps, path: rootPath } = this.state;

    const result: App[] = [];

    if (root || !nameFilter) {
      result.push({
        name: ROOT_APP_NAME,
        root: true,
        path: rootPath,
      });
    }

    const names: string[] = [];

    if (!root && !nameFilter && apps) {
      names.push(...apps);
    } else if (nameFilter) {
      for (const name of nameFilter) {
        if (!apps?.has(name)) {
          throw new Exception(`App "${name}" was not found`);
        }
        names.push(name);
      }
    }

    for (const name of names) {
      result.push({
        name,
        root: false,
        path: join(rootPath, 'apps', name),
      });
    }

    if (!result.length) {
      throw new Exception('No runnable apps were found');
    }

    return result;
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
