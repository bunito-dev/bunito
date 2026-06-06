import { basename, join, sep } from 'node:path';
import type { RawObject } from '@bunito/common';
import { isObject } from '@bunito/common';
import { OnInit, Provider } from '@bunito/container';
import { Eta } from 'eta';
import { isKebabCase, ROOT_PATH } from '../../common';
import type { TemplateFactory } from '../../templates';
import { CLIException } from '../cli';
import { IOService } from '../io';
import { BUNITO_PKG_NAME, ROOT_APP_NAME } from './constants';
import type { AppOptions, AppState, ProjectState } from './types';

@Provider({
  injects: [IOService, null],
})
export class ProjectService {
  private loadedState: ProjectState | undefined;

  constructor(
    private readonly ioService: IOService,
    private readonly templateEngine: Eta = new Eta({
      views: join(ROOT_PATH, 'src', 'templates', 'views'),
    }),
  ) {}

  get state(): ProjectState {
    if (!this.loadedState) {
      throw new CLIException('Project state is not loaded');
    }

    return this.loadedState;
  }

  @OnInit()
  async loadState(): Promise<void> {
    const { cwd } = this.ioService;

    const paths = cwd.split(sep);

    let name: string | undefined;
    let path: string | undefined;
    let initialized: boolean | undefined;

    while (paths.length > 1) {
      path = paths.join(sep);

      const pkgFile = this.ioService.getFile(path, 'package.json');
      const pkgFileStat = await pkgFile.tryStat();

      if (pkgFileStat) {
        const pkgInfo = (await pkgFile.tryJSON()) as {
          name: string;
          dependencies: RawObject;
        };

        if (!pkgInfo?.dependencies[BUNITO_PKG_NAME]) {
          throw new CLIException('Invalid project package.json file');
        }

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

    let checkStats = await this.ioService.getFile(path, 'src', 'main.ts').tryStat();

    if (checkStats?.isFile()) {
      this.loadedState.root = true;
    }

    const appDirs = await this.ioService.readDir(path, 'apps');

    if (appDirs) {
      for (const appDir of appDirs) {
        checkStats = await this.ioService
          .getFile(appDir.name, 'src', 'main.ts')
          .tryStat();

        if (!checkStats?.isFile()) {
          continue;
        }

        this.loadedState.apps ??= new Set();
        this.loadedState.apps.add(basename(appDir.name));
      }
    }

    const libsDirs = await this.ioService.readDir(path, 'libs');

    if (libsDirs) {
      for (const libDir of libsDirs) {
        checkStats = await this.ioService
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

  requireInitialized(): void {
    if (!this.state.initialized) {
      throw new CLIException('Project is not initialized');
    }
  }

  initialize(name: string): void {
    this.state.initialized = true;
    this.state.name = name;
    this.state.root = true;
  }

  async synchronize(): Promise<void> {
    const { path, root, apps, libs } = this.state;

    const tsConfigFile = this.ioService.getFile(path, 'tsconfig.json');

    const tsConfig = await tsConfigFile.tryJSON<{
      compilerOptions?: {
        paths?: Record<string, string[]>;
      };
    }>();

    if (!tsConfig) {
      throw new CLIException('Could not read tsconfig.json');
    }

    if (!isObject(tsConfig) || Array.isArray(tsConfig)) {
      throw new CLIException('tsconfig.json is not an object');
    }

    let paths: Record<string, string[]> | undefined;

    if (root) {
      paths ??= {};
      paths['@app'] = ['./src/index.ts'];
    }

    if (apps) {
      paths ??= {};
      for (const app of apps) {
        paths[`@apps/${app}`] = [`./apps/${app}/src/index.ts`];
      }
    }

    if (libs) {
      paths ??= {};
      for (const lib of libs) {
        paths[`@libs/${lib}`] = [`./libs/${lib}/src/index.ts`];
      }
    }

    const oldPaths = tsConfig?.compilerOptions?.paths;

    if (oldPaths) {
      for (const [key, value] of Object.entries(oldPaths)) {
        if (key === '@app' || key.startsWith('@apps/') || key.startsWith('@libs/')) {
          continue;
        }

        paths ??= {};
        paths[key] = value;
      }
    }

    tsConfig.compilerOptions ??= {};
    tsConfig.compilerOptions.paths = paths;

    await tsConfigFile.write(JSON.stringify(tsConfig, null, 2));
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

  addLib(name: string): void {
    if (!isKebabCase(name)) {
      throw new CLIException(`Lib name ${name} is not kebab-case`);
    }

    if (this.state.libs?.has(name)) {
      throw new CLIException(`Lib ${name} already exists`);
    }

    this.state.libs ??= new Set();
    this.state.libs.add(name);
  }

  async getApps(options: {
    includeRoot: boolean;
    includeApps: boolean;
    appNames: Set<string> | null;
  }): Promise<AppState[]> {
    const { root, apps } = this.state;

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

    return {
      prefix: '',
      ...options,
      files: {
        entry: join(appPath, 'src', 'main.ts'),
        env: join(appPath, '.env'),
        out: join('out', root ? '' : name, 'main.js'),
      },
    };
  }

  renderTemplate<Template extends TemplateFactory>(
    template: Template,
    ...args: Parameters<typeof template>
  ): (...paths: string[]) => Promise<string[]> {
    return async (...paths) => {
      const result: string[] = [];

      const { path: projectPath } = this.state;

      const basePath = join(...paths);
      const rootPath = join(projectPath, basePath);

      for (const [filePath, viewOptions] of Object.entries(template(...args))) {
        if (!viewOptions) {
          continue;
        }

        const { view, params = {} } = viewOptions;

        const content = await this.templateEngine.renderAsync(`${view}.eta`, params);
        const file = this.ioService.getFile(rootPath, filePath);

        await file.write(content);

        result.push(join(basePath, filePath));
      }

      return result;
    };
  }
}
