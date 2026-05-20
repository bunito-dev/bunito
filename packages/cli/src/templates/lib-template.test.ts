import { describe, expect, it } from 'bun:test';
import { LibTemplate } from './lib-template';
import { renderTemplate } from './utils';

describe('LibTemplate', () => {
  it('renders a library module and service', () => {
    const result = renderTemplate(LibTemplate, { name: 'shared-auth' });

    expect(Object.keys(result).sort()).toEqual([
      'src/index.ts',
      'src/shared-auth-module.test.ts',
      'src/shared-auth-module.ts',
      'src/shared-auth-service.test.ts',
      'src/shared-auth-service.ts',
      'test/shared-auth.spec.ts',
    ]);
    expect(result['src/shared-auth-module.ts']).toContain(
      'export class SharedAuthModule',
    );
    expect(result['src/shared-auth-service.ts']).toContain(
      'export class SharedAuthService',
    );
    expect(result['src/index.ts']).toContain("export * from './shared-auth-module'");
    expect(result['test/shared-auth.spec.ts']).toContain('@libs/shared-auth');
  });
});
