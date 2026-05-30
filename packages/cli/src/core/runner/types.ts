import type { RawObject } from '@bunito/common';
import type { Logger } from '@bunito/logger';

export type ProcessLabelStyle = 'name' | 'pid' | 'full';

export type ProcessOptions = {
  name: string;
  prefix: string;
  args: string[];
  envs?: RawObject<string>;
};

export type ProcessRunning = {
  name: string;
  prefix: string;
  logger: Logger;
  proc: Bun.Subprocess<'inherit', 'pipe', 'pipe'>;
};
