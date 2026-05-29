import { basename, join, sep } from 'node:path';
import { OnInit, Provider } from '@bunito/container';
import { isKebabCase } from '../../common';
import { CLIException } from '../cli';
import { SystemService } from '../system';
import { PROJECT_PKG_DEPT, ROOT_APP_NAME } from './constants';
import type { AppOptions, AppState, ProjectState } from './types';

@Provider({
  injects: [SystemService],
})
export class ProjectService {
  private loadedState: ProjectState | undefined;

  constructor(private readonly systemService: SystemService) {}

  get state(): ProjectState {
    if (!this.loadedState) {
      throw new CLIException('Project state is not loaded');
    }

    return this.loadedState;
  }

  @OnInit()
  async loadState(): Promise<void> {
    const { cwd } = this.systemService;

    const paths = cwd.split(sep);

    let name: string | undefined;
    let path: string | undefined;
    let initialized: boolean | undefined;

    while (paths.length > 1) {
      path = paths.join(sep);

      const pkgInfo = await this.systemService.readPkgInfo(path);

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

    this.loadedState = {
      name,
      path,
      initialized,
    };

    if (!initialized) {
      return;
    }

    let checkStats = await this.systemService.getFile(path, 'src', 'main.ts').tryStat();

    if (checkStats?.isFile()) {
      this.loadedState.root = true;
    }

    const appDirs = await this.systemService.readDir(path, 'apps');

    if (appDirs) {
      for (const appDir of appDirs) {
        checkStats = await this.systemService
          .getFile(appDir.name, 'src', 'main.ts')
          .tryStat();

        if (!checkStats?.isFile()) {
          continue;
        }

        this.loadedState.apps ??= new Set();
        this.loadedState.apps.add(basename(appDir.name));
      }
    }

    const libsDirs = await this.systemService.readDir(path, 'libs');

    if (libsDirs) {
      for (const libDir of libsDirs) {
        checkStats = await this.systemService
          .getFile(libDir.name, 'src', 'index.ts')
          .tryStat();

        if (!checkStats?.isFile()) {
          continue;
        }

        this.loadedState.libs ??= new Set();
        this.loadedState.libs.add(basename(libDir.name));
      }
    }
  }

  initialize(name: string): void {
    this.state.name = name;
    this.state.root = true;
  }

  addApp(name?: string): void {
    if (!name) {
      if (this.state.root) {
        throw new CLIException('Project already has a root');
      }

      this.state.root = true;
      return;
    }

    if (!isKebabCase(name)) {
      throw new CLIException(`App name ${name} is not kebab-case`);
    }
    if (name === ROOT_APP_NAME) {
      throw new CLIException(`Invalid app name ${name}`);
    }

    if (this.state.apps?.has(name)) {
      throw new CLIException(`App ${name} already exists`);
    }

    this.state.apps ??= new Set();
    this.state.apps.add(name);
  }

  async getApps(options: {
    includeRoot: boolean;
    includeApps: boolean;
    appNames: Set<string> | null;
  }): Promise<AppState[]> {
    const { root, apps, initialized } = this.state;

    if (!initialized) {
      throw new CLIException('Project is not initialized');
    }

    if (options.includeApps && options.appNames) {
      throw new CLIException('Cannot include both apps and specific apps');
    }

    if (!root && options.includeRoot) {
      throw new CLIException('Cannot include root when project is not root');
    }

    const includeRoot =
      options.includeRoot || (!options.includeApps && !options.appNames);

    const includeApps =
      options.includeApps || (!options.includeRoot && !options.appNames);

    const result: AppState[] = [];

    let prefixWidth = 0;

    if (includeRoot) {
      if (root) {
        prefixWidth = Math.max(prefixWidth, ROOT_APP_NAME.length);

        result.push(
          await this.buildApp({
            name: ROOT_APP_NAME,
            root: true,
          }),
        );
      }
    }

    if (includeApps || options.appNames) {
      const appNames = options.appNames ?? new Set(apps);

      for (const name of appNames) {
        if (!apps?.has(name)) {
          throw new CLIException(`App ${name} not found`);
        }

        prefixWidth = Math.max(prefixWidth, name.length);

        result.push(
          await this.buildApp({
            name,
            root: false,
          }),
        );
      }
    }

    if (!result.length) {
      throw new CLIException('No apps found');
    }

    if (result.length > 1) {
      for (const app of result) {
        app.prefix = app.name.padEnd(prefixWidth, '_');
      }
    }

    return result;
  }

  async buildApp(options: AppOptions): Promise<AppState> {
    const { root, name } = options;

    const appPath = root ? '' : join('apps', name);
    const outPath = join('out', root ? '' : name);

    return {
      prefix: '',
      ...options,
      entryFile: join(appPath, 'src', 'main.ts'),
      envsFile: join(appPath, '.env'),
      outPath,
      outFile: join(outPath, 'main.js'),
    };
  }
}
