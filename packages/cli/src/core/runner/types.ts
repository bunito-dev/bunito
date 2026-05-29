import type { RawObject } from '@bunito/common';
import type { Logger } from '@bunito/logger';

export type StartProcessOptions = {
  label?: 'name' | 'pid' | 'full';
};

export type ProcessOptions = {
  name: string;
  args: string[];
  envs?: RawObject<string>;
};

export type ProcessRunning = {
  name: string;
  logger: Logger;
  proc: Bun.Subprocess<'inherit', 'pipe', 'pipe'>;
};

export type ProcessWriter = (buffer: string) => void;
