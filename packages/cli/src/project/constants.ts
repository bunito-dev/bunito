import type { InspectColor } from 'node:util';

export const PROJECT_DIRS = {
  apps: 'apps',
  libs: 'libs',
} as const;

export const PROJECT_FILES = {
  config: 'bunito.json',
  pkg: 'package.json',
  tsconfig: 'tsconfig.json',
};

export const APP_COLORS: InspectColor[] = ['cyan', 'magenta', 'blue', 'green', 'yellow'];
