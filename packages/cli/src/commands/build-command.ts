import { join } from 'node:path';
import { notEmptySet } from '../common';
import type { Context } from '../context';
import { CLIService } from '../services';
import { AbstractCommand } from './abstract-command';

type BuildCommandOptions = {
  apps: Set<string> | null;
  root: boolean;
  disable?: ('sourcemap' | 'minify')[];
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

    const { apps: onlyNames, root, disable } = this.options;
    const { path: projectPath } = state;

    const disabled = new Set(disable);

    const apps = project.getApps(root, onlyNames);

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
        minify: !disabled.has('minify'),
        features: ['RUNTIME_ONLY'],
        packages: 'bundle',
        sourcemap: disabled.has('sourcemap') ? 'none' : 'inline',
        entrypoints: [join(app.path, 'src', 'main.ts')],
        tsconfig: join(projectPath, 'tsconfig.json'),
      });

      if (success && output) {
        const outPath = app.root ? join('out') : join('out', app.name);

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
        describe: 'App name(s) to build',
        array: true,
        type: 'string',
        coerce: notEmptySet<string>,
      })
      .option('root', {
        alias: ['r'],
        describe: 'Build the root app',
        type: 'boolean',
        default: false,
      })
      .option('disable', {
        alias: ['d'],
        describe: 'Disable',
        type: 'string',
        array: true,
        choices: ['sourcemap', 'minify'],
      }),
});
