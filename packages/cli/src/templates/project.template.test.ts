import { describe, expect, it } from 'bun:test';
import { ProjectTemplate } from './project.template';

describe('ProjectTemplate', () => {
  it('describes project-level files', () => {
    expect(
      ProjectTemplate({
        name: 'demo',
        pkgVersion: 'workspace:*',
        bunVersion: '>=1.3.10',
      }),
    ).toEqual({
      '.gitignore': {
        view: 'project/.gitignore',
      },
      'package.json': {
        view: 'project/package.json',
        params: {
          name: 'demo',
          pkgVersion: 'workspace:*',
          bunVersion: '>=1.3.10',
        },
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
    });
  });
});
