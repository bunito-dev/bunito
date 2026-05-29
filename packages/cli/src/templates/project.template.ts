import type { TemplateViews } from './types';

export function ProjectTemplate(options: {
  name: string;
  pkgVersion: string;
  bunVersion?: string;
}): TemplateViews {
  const { name, pkgVersion, bunVersion } = options;

  return {
    '.gitignore': {
      view: 'project/.gitignore',
    },
    'package.json': {
      view: 'project/package.json',
      params: {
        name,
        pkgVersion,
        bunVersion,
      },
    },
    'README.md': {
      view: 'project/README.md',
      params: {
        name,
      },
    },
    'tsconfig.json': {
      view: 'project/tsconfig.json',
    },
  };
}
