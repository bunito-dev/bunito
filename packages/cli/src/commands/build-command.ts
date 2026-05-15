import { join } from 'node:path';
import { notEmptySet } from '../common';
import type { Context } from '../context';
import type { ProjectApp } from '../services';
import {
  CLIService,
  PROJECT_ENTRY_FILE,
  PROJECT_OUT_DIR,
  PROJECT_TSCONFIG_FILE,
} from '../services';
import { AbstractCommand } from './abstract-command';

type BuildCommandOptions = {
  apps?: Set<string>;
  all?: boolean;
  minify?: boolean;
  sourcemap?: boolean;
};

export class BuildCommand extends AbstractCommand<BuildCommandOptions> {
  // biome-ignore lint/complexity/noUselessConstructor: Bun coverage counts generated subclass constructors as uncovered.
  constructor(options: BuildCommandOptions, context: Context) {
    super(options, context);
  }

  public async run(): Promise<void> {
    const { project, logger, fs } = this.context;
    const { state } = project;

    project.requireInitialized();

    const { apps: onlyNames, all, minify, sourcemap } = this.options;
    const { path: projectPath } = state;

    let apps: ProjectApp[];

    if (all || onlyNames) {
      apps = project.getApps(onlyNames);
    } else {
      apps = [project.getApp()];
    }

    for (const [index, app] of apps.entries()) {
      if (index) {
        logger.br();
      }

      const {
        success,
        outputs: [output],
      } = await Bun.build({
        root: projectPath,
        target: 'bun',
        minify,
        packages: 'bundle',
        sourcemap: sourcemap ? 'inline' : 'none',
        entrypoints: [join(app.path, PROJECT_ENTRY_FILE)],
        tsconfig: join(app.path, PROJECT_TSCONFIG_FILE),
      });

      if (success && output) {
        const outPath = app.main
          ? join(PROJECT_OUT_DIR)
          : join(PROJECT_OUT_DIR, app.name);

        await fs.ensurePath(projectPath, outPath);

        const content = await output.text();

        const file = fs.getFile(projectPath, outPath, 'main.js');
        await file.write(content);

        logger.info(`Built "${app.name}" app:`, join(outPath, 'main.js'));
      }
    }
  }
}

CLIService.registerCommand(BuildCommand, {
  command: 'build [apps...]',
  aliases: ['b'],
  describe: 'Build the app(s)',
  builder: (yargs) =>
    yargs
      .positional('apps', {
        describe: 'App names',
        array: true,
        type: 'string',
        coerce: notEmptySet<string>,
      })
      .option('all', {
        describe: 'Build all apps except main one',
        default: false,
        type: 'boolean',
        alias: 'a',
      })
      .option('sourcemap', {
        describe: 'Build with inline source maps',
        default: false,
        type: 'boolean',
        alias: 's',
      })
      .option('minify', {
        describe: 'Minify the output',
        default: false,
        type: 'boolean',
        alias: 'm',
      }),
});
