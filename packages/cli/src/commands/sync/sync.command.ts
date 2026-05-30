import { Logger } from '@bunito/logger';
import { ProjectService } from '../../core';
import { Command } from '../command';
import type { CommandBuilt } from '../types';

@Command({
  injects: [Logger, ProjectService],
})
export class SyncCommand implements Command {
  constructor(
    private readonly logger: Logger,
    private readonly projectService: ProjectService,
  ) {}

  async run(): Promise<void> {
    this.projectService.requireInitialized();

    await this.projectService.synchronize();

    this.logger.ok('Project synchronized');
  }

  build(): CommandBuilt {
    return {
      command: 'sync',
      aliases: ['s'],
      describe: 'Synchronize project',
    };
  }
}
