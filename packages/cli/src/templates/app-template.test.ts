import { describe, expect, it } from 'bun:test';
import { AppTemplate } from './app-template';
import { renderTemplate } from './utils';

describe('AppTemplate', () => {
  it('renders a template', () => {
    const result = renderTemplate(AppTemplate);

    expect(Object.keys(result).sort()).toEqual([
      '.env',
      'src/app-module.ts',
      'src/index.ts',
      'src/main.ts',
    ]);
    expect(result['src/app-module.ts']).toContain('export class AppModule');
    expect(result['src/index.ts']).toContain("export * from './app-module'");
  });
});
