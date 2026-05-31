import { describe, expect, it, mock } from 'bun:test';
import type { Logger } from '@bunito/logger';
import type { IOService, ProjectService } from '../../core';
import { CLIException } from '../../core';
import { InitCommand } from './init.command';

function createLogger() {
  return {
    ok: mock(() => undefined),
  } as unknown as Logger;
}

function createProjectService(initialized = false) {
  const render = mock(() => mock(async () => ['generated.ts']));

  return {
    state: {
      initialized,
      name: 'default-name',
      path: '/project',
    },
    initialize: mock(() => undefined),
    addApp: mock(() => undefined),
    renderTemplate: render,
    synchronize: mock(async () => undefined),
  } as unknown as ProjectService;
}

describe('InitCommand', () => {
  it('initializes projects and creates requested workspace apps', async () => {
    const logger = createLogger();
    const ioService = {
      readPkgInfo: mock(async () => ({
        version: '0.0.15',
        engines: {
          bun: '>=1.3.10',
        },
      })),
    } as unknown as IOService;
    const projectService = createProjectService();
    const command = new InitCommand(logger, ioService, projectService);

    await command.run({
      project: 'demo',
      app: new Set(['api', 'worker']),
    });

    expect(projectService.initialize).toHaveBeenCalledWith('demo');
    expect(projectService.addApp).toHaveBeenNthCalledWith(1, 'api');
    expect(projectService.addApp).toHaveBeenNthCalledWith(2, 'worker');
    expect(projectService.synchronize).toHaveBeenCalled();
    expect(logger.ok).toHaveBeenNthCalledWith(1, 'Project initialized:', [
      'generated.ts',
    ]);
    expect(logger.ok).toHaveBeenNthCalledWith(2, 'Root app created:', ['generated.ts']);
    expect(logger.ok).toHaveBeenNthCalledWith(3, 'Api app created:', ['generated.ts']);
    expect(logger.ok).toHaveBeenNthCalledWith(4, 'Worker app created:', ['generated.ts']);
  });

  it('prompts for project and app names when options request interactivity', async () => {
    const answers = ['prompted-project', 'api', ''];
    const ioService = {
      readInput: mock(async () => answers.shift() ?? ''),
      readPkgInfo: mock(async () => undefined),
    } as unknown as IOService;
    const projectService = createProjectService();
    const command = new InitCommand(createLogger(), ioService, projectService);

    await command.run({
      project: '',
      app: null,
    });

    expect(projectService.initialize).toHaveBeenCalledWith('prompted-project');
    expect(projectService.addApp).toHaveBeenCalledWith('api');
  });

  it('rejects already initialized projects', async () => {
    const command = new InitCommand(
      createLogger(),
      {} as IOService,
      createProjectService(true),
    );

    let error: unknown;
    try {
      await command.run({ project: 'demo', app: undefined as never });
    } catch (caught) {
      error = caught;
    }

    expect(error).toEqual(
      new CLIException('Project already initialized at:', '/project'),
    );
  });

  it('describes the init command options', () => {
    const command = new InitCommand({} as Logger, {} as IOService, {} as ProjectService);
    const built = command.build();
    const yargs = {
      positional: mock(() => yargs),
      option: mock(() => yargs),
    };

    if (typeof built.builder === 'function') {
      built.builder(yargs as never);
    }

    expect(built).toMatchObject({
      command: 'init [project]',
      describe: 'Initialize a bunito project',
    });
    expect(yargs.positional).toHaveBeenCalled();
    expect(yargs.option).toHaveBeenCalled();
  });
});
