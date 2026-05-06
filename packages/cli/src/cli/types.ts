import type { CommandModule } from 'yargs';
import type { CLI } from './cli';

export type CLISettings = {
  cwd: string;
  debug: boolean;
  pkgVersion: string;
  bunVersion: string;
};

export type CLICommandOptions = {
  builder: (cli: CLI) => CommandModule;
  priority: number;
};
