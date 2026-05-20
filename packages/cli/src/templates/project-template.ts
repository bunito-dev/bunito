import type { TemplateResult } from './types';

export function ProjectTemplate(options: {
  name: string;
  pkgVersion: string;
  bunVersion?: string;
}): TemplateResult {
  const { name, pkgVersion, bunVersion } = options;
  return {
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
      scripts: {
        cli: 'bunito',
        build: 'bunito build',
        start: 'bunito start',
        test: 'bun test',
        coverage: 'bun run test --coverage',
      },
      dependencies: {
        '@bunito/bunito': pkgVersion,
      },
      devDependencies: {
        '@bunito/cli': pkgVersion,
        '@bunito/testing': pkgVersion,
      },
      engines: bunVersion
        ? {
            bun: bunVersion,
          }
        : undefined,
    },

    'README.md': `
      # \`${name}\`
      
      ## Installation
      ${'```bash'}
      bun install
      ${'```'}
    `,

    'tsconfig.json': {
      extends: '@bunito/bunito/tsconfig.json',
      compilerOptions: {
        paths: {
          '@app': ['./src/index.ts'],
          '@apps/*': ['./apps/*/src/index.ts'],
          '@libs/*': ['./libs/*/src/index.ts'],
        },
      },
    },
  };
}
