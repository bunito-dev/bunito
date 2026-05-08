import { describe, expect, it } from 'bun:test';
import { ProjectTemplate } from './project.template';
import { renderTemplate } from './utils';

describe('ProjectTemplate', () => {
  it('renders a standard project', () => {
    const result = renderTemplate(ProjectTemplate, {
      name: 'demo',
      pkgVersion: '1.0.0',
      bunVersion: '>=1.3.11',
      apps: [],
    });

    expect(Object.keys(result).sort()).toContain('src/app.module.ts');
    expect(result['package.json']).toContain('"name": "demo"');
    expect(result['package.json']).toContain('"@bunito/bunito": "1.0.0"');
    expect(result['tsconfig.json']).toContain('@bunito/common/tsconfig.json');
  });

  it('renders a monorepo project with app path aliases', () => {
    const result = renderTemplate(ProjectTemplate, {
      name: 'workspace',
      pkgVersion: 'workspace:*',
      apps: ['api'],
    });

    expect(Object.keys(result).sort()).toContain('apps/api/src/api.module.ts');
    expect(result['package.json']).toContain('"apps"');
    expect(result['tsconfig.json']).toContain('"@apps/*"');
    expect(result['tsconfig.json']).not.toContain('"engines"');
  });
});
