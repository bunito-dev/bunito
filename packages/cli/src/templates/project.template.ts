import type { TemplateViews } from './types';
import {
  BIOME_VERSION,
  BUN_ENGINE_VERSION,
  BUN_TYPES_VERSION,
  BUNITO_VERSION,
  TYPESCRIPT_VERSION,
} from './versions';

export function ProjectTemplate(options: { name: string }): TemplateViews {
  const { name } = options;

  return {
    '.gitignore': {
      view: 'project/.gitignore',
    },
    'package.json': {
      view: 'project/package.json',
      params: {
        name,
        bunitoVersion: BUNITO_VERSION,
        biomeVersion: BIOME_VERSION,
        bunTypesVersion: BUN_TYPES_VERSION,
        typescriptVersion: TYPESCRIPT_VERSION,
        bunEngineVersion: BUN_ENGINE_VERSION,
      },
    },
    'README.md': {
      view: 'project/README.md',
      params: {
        name,
      },
    },
    'biome.json': {
      view: 'project/biome.json',
    },
    'tsconfig.json': {
      view: 'project/tsconfig.json',
    },
  };
}
