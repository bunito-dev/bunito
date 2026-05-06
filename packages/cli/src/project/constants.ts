import { z } from 'zod';

export const DEFAULT_APP_NAME = 'default';

export const PROJECT_FILES = {
  main: 'main.ts',
  envs: '.env',
} as const;

export const PROJECT_DIRS = {
  src: 'src',
  apps: 'apps',
  libs: 'libs',
} as const;

export const PROJECT_PKG_SCHEMA = z.looseObject({
  name: z.string().optional(),
  private: z.literal(true).optional(),
  type: z.literal('module').default('module'),
  scripts: z.record(z.string(), z.string()).default({}),
  dependencies: z.record(z.string(), z.string()),
  devDependencies: z.record(z.string(), z.string()).optional().default({}),
  engines: z.record(z.string(), z.string()).optional().default({}),
});

export const PROJECT_PKG_DEPT = '@bunito/bunito';
