import { join } from 'node:path';
import type { RawObject } from '@bunito/common';
import { PROJECT_APPS_DIR } from '#services';
import { AppTemplate } from './app.template';
import type { TemplateResult } from './types';

export function ProjectTemplate(options: {
  name: string;
  pkgVersion: string;
  bunVersion?: string;
  apps: string[];
}): TemplateResult {
  const { name, pkgVersion, bunVersion, apps } = options;

  let src: TemplateResult;

  let pkgFiles: string[];

  let tsCompilerOptions: RawObject | undefined;

  if (!apps.length) {
    src = AppTemplate();

    pkgFiles = ['src', '!src/**/*.test.ts'];
  } else {
    src = {};

    pkgFiles = ['apps', 'libs', '!apps/**/*.test.ts', '!libs/**/*.test.ts'];

    for (const app of apps) {
      const appSrc = AppTemplate({ name: app });

      src = {
        ...src,
        ...Object.fromEntries(
          Object.entries(appSrc).map(([key, value]) => [
            join(PROJECT_APPS_DIR, app, key),
            value,
          ]),
        ),
      };
    }

    tsCompilerOptions = {
      paths: {
        '@apps/*': ['./apps/*'],
        '@libs/*': ['./libs/*'],
      },
    };
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

    'package.json': {
      name,
      private: true,
      type: 'module',
      files: [...pkgFiles, 'README.md'],
      scripts: {
        cli: 'bunx bunito',
        build: 'bunx bunito build',
        start: 'bunx bunito start',
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

    'README.md': `
      # ${name}
      
      ## Installation
      ${'```bash'}
      bun install
      ${'```'}
    `,

    'tsconfig.json': {
      extends: '@bunito/common/tsconfig.json',
      compilerOptions: tsCompilerOptions,
    },
  };
}
