import { join } from 'node:path';
import { Exception, notEmptySet } from '#common';
import { CLIService, PROJECT_OUT_DIR } from '#services';
import { Command } from './command';

export class BuildCommand extends Command<{
  apps?: Set<string>;
  minify?: boolean;
  sourcemap?: boolean;
}> {
  public async run(): Promise<void> {
    const { project, logger, fs } = this.context;
    const { settings } = project;

    if (settings.mode === 'unknown') {
      throw new Exception('Project not initialized');
    }

    const { apps: appNames, minify, sourcemap } = this.options;
    const { mode, path: root } = settings;

    const apps = project.getApps(appNames);
    const app = apps[0];

    if (!app) {
      throw new Exception('No apps to build');
    }

    for (const [index, app] of apps.entries()) {
      if (index) {
        logger.br();
      }

      const {
        success,
        outputs: [output],
      } = await Bun.build({
        root,
        target: 'bun',
        minify,
        sourcemap: sourcemap ? 'inline' : 'none',
        entrypoints: [app.entry],
      });

      if (success && output) {
        const outPath =
          mode === 'standard' ? join(PROJECT_OUT_DIR) : join(PROJECT_OUT_DIR, app.name);

        const path = join(root, outPath);
        await fs.ensurePath(path);

        const content = await output.text();
        const file = fs.getFile(path, 'main.js');
        await file.write(content);

        logger.info(`Built ${app.name} app:`, join(outPath, 'main.js'));
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
      .option('sourcemap', {
        describe: 'Build with inline sourcemap',
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
