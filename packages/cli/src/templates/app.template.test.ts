import { describe, expect, it } from 'bun:test';
import { AppTemplate } from './app.template';
import { renderTemplate } from './utils';

describe('AppTemplate', () => {
  it('renders a standard app template', () => {
    const result = renderTemplate(AppTemplate);

    expect(Object.keys(result).sort()).toEqual([
      '.env',
      'src/app.module.ts',
      'src/main.ts',
    ]);
    expect(result['src/app.module.ts']).toContain('export class AppModule');
  });

  it('renders a named app template', () => {
    const result = renderTemplate(AppTemplate, { name: 'admin-api' });

    expect(Object.keys(result).sort()).toEqual([
      '.env',
      'src/admin-api.module.ts',
      'src/admin-api.service.ts',
      'src/index.ts',
      'src/main.ts',
    ]);
    expect(result['src/admin-api.module.ts']).toContain('export class AdminApiModule');
    expect(result['src/admin-api.service.ts']).toContain('export class AdminApiService');
  });
});
