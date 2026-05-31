import { describe, expect, it, mock } from 'bun:test';
import type { Logger } from '@bunito/logger';
import type { IOService, ProjectService } from '../../core';
import { CLIException } from '../../core';
import { GenerateCommand } from './generate.command';

function createLogger() {
  return {
    ok: mock(() => undefined),
  } as unknown as Logger;
}

function createProjectService(files: string[] = ['generated.ts']) {
  const render = mock(() => mock(async () => files));

  return {
    state: {
      name: 'demo',
    },
    requireInitialized: mock(() => undefined),
    addApp: mock(() => undefined),
    addLib: mock(() => undefined),
    renderTemplate: render,
    synchronize: mock(async () => undefined),
  } as unknown as ProjectService;
}

describe('GenerateCommand', () => {
  it('generates root and workspace apps', async () => {
    const logger = createLogger();
    const ioService = {} as IOService;
    const projectService = createProjectService();
    const command = new GenerateCommand(logger, ioService, projectService);

    await command.run({ resource: 'app' });
    await command.run({ resource: 'app', name: 'admin-api' });

    expect(projectService.requireInitialized).toHaveBeenCalledTimes(2);
    expect(projectService.addApp).toHaveBeenNthCalledWith(1, undefined);
    expect(projectService.addApp).toHaveBeenNthCalledWith(2, 'admin-api');
    expect(projectService.synchronize).toHaveBeenCalledTimes(2);
    expect(logger.ok).toHaveBeenNthCalledWith(1, 'Root app generated:', ['generated.ts']);
    expect(logger.ok).toHaveBeenNthCalledWith(2, 'AdminApi app generated:', [
      'generated.ts',
    ]);
  });

  it('prompts for missing library names and rejects empty answers', async () => {
    const logger = createLogger();
    const ioService = {
      readInput: mock(async () => 'shared-auth'),
    } as unknown as IOService;
    const projectService = createProjectService();
    const command = new GenerateCommand(logger, ioService, projectService);

    await command.run({ resource: 'lib' });

    expect(ioService.readInput).toHaveBeenCalledWith({ message: 'Lib name' });
    expect(projectService.addLib).toHaveBeenCalledWith('shared-auth');
    expect(logger.ok).toHaveBeenCalledWith('SharedAuth lib generated:', ['generated.ts']);

    const emptyCommand = new GenerateCommand(
      logger,
      {
        readInput: mock(async () => ''),
      } as unknown as IOService,
      createProjectService(),
    );

    let error: unknown;
    try {
      await emptyCommand.run({ resource: 'lib' });
    } catch (caught) {
      error = caught;
    }

    expect(error).toEqual(new CLIException('No lib name provided'));
  });

  it('describes the generate command options', () => {
    const command = new GenerateCommand(
      {} as Logger,
      {} as IOService,
      {} as ProjectService,
    );
    const built = command.build();
    const yargs = {
      positional: mock(() => yargs),
    };

    if (typeof built.builder === 'function') {
      built.builder(yargs as never);
    }

    expect(built).toMatchObject({
      command: 'generate <resource> [name]',
      aliases: ['g'],
      describe: 'Generate an app or library',
    });
    expect(yargs.positional).toHaveBeenCalledTimes(2);
  });
});
