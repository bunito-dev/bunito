import * as process from 'node:process';
import { spawn } from 'bun';
import { z } from 'zod';
import { Command } from './command';

export const StartOptionsSchema = z.object({
  apps: z.array(z.string()),
  watch: z.boolean().default(false).describe('Watch for changes'),
  help: z.boolean().default(false),
});

export class StartCommand extends Command<typeof StartOptionsSchema> {
  constructor() {
    super(StartOptionsSchema, {
      w: 'watch',
      h: 'help',
    });
  }

  override async execute(): Promise<void> {
    const { watch, help } = this.options;

    if (help) {
      console.log('Usage: bunito [command] [app]');
      return;
    }

    const apps = await this.readApps(this.options.apps);
    const cwd = process.cwd();

    await Promise.all(
      apps.map(({ main }) => {
        const cmd = ['bun', 'run'];

        if (watch) {
          cmd.push('--watch');
        }

        cmd.push(main);

        const proc = spawn({
          cmd,
          cwd,
          stdin: 'inherit',
          stdout: 'inherit',
          stderr: 'inherit',
        });

        return proc.exited;
      }),
    );
  }
}
