import { describe, expect, it, mock } from 'bun:test';
import process from 'node:process';
import type { Logger } from '@bunito/logger';
import type { IOService } from '../core';
import type { Command } from './command';
import { CommandService } from './command.service';

describe('CommandService', () => {
  it('parses registered commands and runs matching handlers', async () => {
    const run = mock(async () => undefined);
    const command = {
      run,
      build: () => ({
        command: 'mock',
        describe: 'Mock command',
      }),
    } satisfies Command;
    const service = new CommandService(
      {} as Logger,
      {
        argv: ['mock'],
      } as IOService,
      [command],
    );

    await service.runCommand();

    expect(run).toHaveBeenCalled();
  });

  it('logs parser failures and exits with a CLI error code', async () => {
    const logger = {
      error: mock(() => undefined),
      info: mock(() => undefined),
    } as unknown as Logger;
    const exit = process.exit;
    process.exit = mock((() => {
      throw new Error('exit');
    }) as typeof process.exit);

    try {
      const service = new CommandService(
        logger,
        {
          argv: [],
        } as unknown as IOService,
        [],
      );

      let error: unknown;
      try {
        await service.runCommand();
      } catch (caught) {
        error = caught;
      }

      expect(error).toEqual(new Error('exit'));
      expect(logger.error).toHaveBeenCalledWith('Provide a command to run.');
      expect(logger.info).toHaveBeenCalledWith(' ');
    } finally {
      process.exit = exit;
    }
  });
});
