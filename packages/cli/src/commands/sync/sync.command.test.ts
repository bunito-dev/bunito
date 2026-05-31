import { describe, expect, it, mock } from 'bun:test';
import type { Logger } from '@bunito/logger';
import type { ProjectService } from '../../core';
import { SyncCommand } from './sync.command';

describe('SyncCommand', () => {
  it('requires initialized projects and synchronizes aliases', async () => {
    const logger = {
      ok: mock(() => undefined),
    } as unknown as Logger;
    const projectService = {
      requireInitialized: mock(() => undefined),
      synchronize: mock(async () => undefined),
    } as unknown as ProjectService;

    await new SyncCommand(logger, projectService).run();

    expect(projectService.requireInitialized).toHaveBeenCalled();
    expect(projectService.synchronize).toHaveBeenCalled();
    expect(logger.ok).toHaveBeenCalledWith('Project synchronized');
  });

  it('describes the sync command options', () => {
    expect(new SyncCommand({} as Logger, {} as ProjectService).build()).toEqual({
      command: 'sync',
      aliases: ['s'],
      describe: 'Synchronize project',
    });
  });
});
