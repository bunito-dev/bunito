import { describe, expect, it } from 'bun:test';
import { AppTemplate } from './app-template';
import { renderTemplate } from './utils';

describe('AppTemplate', () => {
  it('renders a template', () => {
    const result = renderTemplate(AppTemplate);

    expect(Object.keys(result).sort()).toEqual([
      '.env',
      'src/app-module.test.ts',
      'src/app-module.ts',
      'src/index.ts',
      'src/main.ts',
      'test/app.spec.ts',
    ]);
    expect(result['src/app-module.ts']).toContain('export class AppModule');
    expect(result['src/app-module.test.ts']).toContain("test.todo('add unit tests'");
    expect(result['src/index.ts']).toContain("export * from './app-module'");
    expect(result['test/app.spec.ts']).toContain("test.todo('add integration tests'");
  });
});
