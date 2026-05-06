import { resolve } from 'node:path';
import { z } from 'zod';
import { PKG_FILE_NAME } from '../common';

export const CLI_PKG_PATH = resolve(import.meta.dirname, `../../${PKG_FILE_NAME}`);

export const CLI_PKG_SCHEMA = z.object({
  version: z.string(),
  engines: z.object({
    bun: z.string(),
  }),
});
