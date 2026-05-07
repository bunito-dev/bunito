import type { CommandModule } from 'yargs';
import type { Context } from '#context';

export type CLICommand = {
  builder: (context: Context) => CommandModule;
  priority: number;
};
