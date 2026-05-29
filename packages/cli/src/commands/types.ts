import type { CommandModule } from 'yargs';

export type CommandBuilt = Omit<CommandModule, 'handler'>;
