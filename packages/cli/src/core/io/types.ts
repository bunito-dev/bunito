import type { Stats } from 'node:fs';

export type File = Bun.BunFile &
  Readonly<{
    name: string;
    tryStat: () => Promise<Stats | undefined>;
    tryJSON: <TContent = unknown>() => Promise<TContent | undefined>;
  }>;
