import { describe, expect, it } from 'bun:test';
import { ProjectTemplate } from './project.template';

describe('ProjectTemplate', () => {
  it('describes project-level files', () => {
    const views = ProjectTemplate({
      name: 'demo',
    });

    expect(Object.keys(views).sort()).toEqual([
      '.gitignore',
      'README.md',
      'biome.json',
      'package.json',
      'tsconfig.json',
    ]);
    expect(views).toEqual({
      '.gitignore': {
        view: 'project/.gitignore',
      },
      'package.json': {
        view: 'project/package.json',
        params: expect.objectContaining({
          name: 'demo',
          bunitoVersion: expect.any(String),
          biomeVersion: expect.any(String),
          bunTypesVersion: expect.any(String),
          typescriptVersion: expect.any(String),
          bunEngineVersion: expect.any(String),
        }),
      },
      'tsconfig.json': {
        view: 'project/tsconfig.json',
      },
      'README.md': {
        view: 'project/README.md',
        params: {
          name: 'demo',
        },
      },
      'biome.json': {
        view: 'project/biome.json',
      },
    });
  });
});
