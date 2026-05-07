import type { Stats } from 'node:fs';
import type { z } from 'zod';
import type { PKG_INFO_SCHEMA } from './constants';

export type PkgInfo = z.infer<typeof PKG_INFO_SCHEMA>;

export type FileExt = Bun.BunFile &
  Readonly<{
    name: string;
    tryStat: () => Promise<Stats | undefined>;
    tryJSON: <TContent = unknown>() => Promise<TContent | undefined>;
  }>;
