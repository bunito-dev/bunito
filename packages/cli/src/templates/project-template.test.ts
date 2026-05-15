import { describe, expect, it } from 'bun:test';
import { ProjectTemplate } from './project-template';
import { renderTemplate } from './utils';

describe('ProjectTemplate', () => {
  it('renders a standard project', () => {
    const result = renderTemplate(ProjectTemplate, {
      name: 'demo',
      pkgVersion: '1.0.0',
      bunVersion: '>=1.3.11',
    });

    expect(Object.keys(result).sort()).toEqual([
      '.gitignore',
      'README.md',
      'package.json',
      'tsconfig.json',
    ]);
    expect(result['package.json']).toContain('"name": "demo"');
    expect(result['package.json']).toContain('"@bunito/bunito": "1.0.0"');
    expect(result['tsconfig.json']).toContain('@bunito/bunito/tsconfig.json');
  });

  it('renders project path aliases without engines when no Bun version is provided', () => {
    const result = renderTemplate(ProjectTemplate, {
      name: 'workspace',
      pkgVersion: 'workspace:*',
    });

    expect(result['tsconfig.json']).not.toContain('"baseUrl"');
    expect(result['tsconfig.json']).toContain('"@apps/*"');
    expect(result['tsconfig.json']).toContain('./apps/*/src/index.ts');
    expect(result['tsconfig.json']).toContain('./libs/*/index.ts');
    expect(result['tsconfig.json']).not.toContain('"engines"');
  });
});
