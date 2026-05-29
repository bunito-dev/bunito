import { z } from 'zod';

export const PKG_INFO_FILE = 'package.json';

export const PKG_INFO_SCHEMA = z.looseObject({
  name: z.string().optional(),
  version: z.string().optional(),
  private: z.literal(true).optional(),
  type: z.literal('module').default('module'),
  scripts: z.record(z.string(), z.string()).default({}),
  dependencies: z.record(z.string(), z.string()).default({}),
  devDependencies: z.record(z.string(), z.string()).optional().default({}),
  engines: z.record(z.string(), z.string()).optional().default({}),
});
