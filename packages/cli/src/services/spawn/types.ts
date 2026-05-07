import type { RawObject } from '@bunito/common';

export type ProcessOptions = {
  name: string;
  args: string[];
  envs?: RawObject<string>;
};

export type ProcessRunning = {
  name: string;
  proc: Bun.Subprocess<'inherit', 'pipe', 'pipe'>;
};

export type ProcessWriter = (buffer: string) => void;
