import { join } from 'node:path';
import { Logger } from '@bunito/logger';
import { notEmptySet } from '../../common';
import { IOService, ProjectService } from '../../core';
import { Command } from '../command';
import type { CommandBuilt } from '../types';
import type { BuildOptions } from './types';

@Command<BuildOptions>({
  injects: [Logger, IOService, ProjectService],
})
export class BuildCommand implements Command<BuildOptions> {
  constructor(
    private readonly logger: Logger,
    private readonly ioService: IOService,
    private readonly projectService: ProjectService,
  ) {}

  async run(options: BuildOptions): Promise<void> {
    this.projectService.requireInitialized();

    const { app: appNames, root: includeRoot, apps: includeApps, disable } = options;

    const disabled = new Set(disable);

    const apps = await this.projectService.getApps({
      appNames,
      includeRoot,
      includeApps,
    });

    const { path: projectPath } = this.projectService.state;

    for (const app of apps) {
      const logger = this.logger.track().usePrefix(app.prefix);

      logger.info('Building App...');

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
        entrypoints: [join(projectPath, app.entryFile)],
        tsconfig: join(projectPath, 'tsconfig.json'),
      });

      if (success && output) {
        const content = await output.text();

        const file = this.ioService.getFile(projectPath, app.outFile);
        await file.write(content);

        logger.info([app.outFile]);
      }
    }
  }

  build(): CommandBuilt {
    return {
      command: 'build [app...]',
      aliases: ['b'],
      describe: 'Build discovered apps',
      builder: (yargs) =>
        yargs
          .positional('app', {
            describe: 'Workspace app names to build',
            array: true,
            type: 'string',
            coerce: notEmptySet<string>,
          })
          .option('root', {
            alias: ['r'],
            describe: 'Include the root app',
            type: 'boolean',
            default: false,
          })
          .option('apps', {
            alias: ['a'],
            describe: 'Include apps',
            type: 'boolean',
            default: false,
          })
          .option('disable', {
            alias: ['d'],
            describe: 'Disable build features',
            type: 'string',
            array: true,
            choices: ['sourcemap', 'minify'],
          }),
    };
  }
}
