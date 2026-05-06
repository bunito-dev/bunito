import { join } from 'node:path';
import type { RawObject } from '@bunito/common';
import { toPascalCase } from '../common';
import { PROJECT_DIRS } from '../project';
import { AppTemplate } from './app.template';
import type { TemplateResult } from './types';

export function ProjectTemplate(options: {
  name: string;
  pkgVersion: string;
  bunVersion?: string;
  apps?: string[];
}): TemplateResult {
  const { name, pkgVersion, bunVersion, apps } = options;

  let src: TemplateResult = !apps ? AppTemplate() : {};

  const files = !apps
    ? ['src', '!src/**/*.test.ts']
    : ['apps', '!apps/**/*.test.ts', 'libs', '!libs/**/*.test.ts'];

  const startScripts: RawObject<string> = {
    start: 'bunx bunito build',
  };

  const buildScripts: RawObject<string> = {
    build: 'bunx bunito build',
  };

  if (apps) {
    for (const app of apps) {
      const appSrc = AppTemplate({ name: app, classPrefix: toPascalCase(app) });

      src = {
        ...src,
        ...Object.fromEntries(
          Object.entries(appSrc).map(([key, value]) => [
            join(PROJECT_DIRS.apps, app, key),
            value,
          ]),
        ),
      };

      startScripts[`start:${app}`] = `bunx bunito start ${app}`;
      buildScripts[`build:${app}`] = `bunx bunito build ${app}`;
    }
  }

  return {
    ...src,
    '.gitignore': `
      # system / ide
      .idea
      .DS_Store
      
      # dependencies
      node_modules
      
      # dotenv
      .env*
      !.env*.sample
      
      # output
      artifacts
      out
      dist
      *.tgz
      
      # caches
      .eslintcache
      .cache
      *.tsbuildinfo
    `,

    'README.md': `
      # ${name}
      
      ## Installation
      ${'```bash'}
      bun install
      ${'```'}
    `,

    'package.json': {
      name,
      private: true,
      type: 'module',
      files: [...files, 'README.md'],
      scripts: {
        cli: 'bunx bunito',
        ...startScripts,
        ...buildScripts,
      },
      dependencies: {
        '@bunito/bunito': pkgVersion,
      },
      devDependencies: {
        '@bunito/cli': pkgVersion,
      },
      engines: bunVersion
        ? {
            bun: bunVersion,
          }
        : undefined,
    },

    'tsconfig.json': {
      extends: '@bunito/common/tsconfig.json',
      compilerOptions: apps
        ? {
            paths: {
              '@apps/*': ['./apps/*'],
              '@libs/*': ['./libs/*'],
            },
          }
        : undefined,
    },
  };
}
