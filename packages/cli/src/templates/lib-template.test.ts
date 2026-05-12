import { describe, expect, it } from 'bun:test';
import { LibTemplate } from './lib-template';
import { renderTemplate } from './utils';

describe('LibTemplate', () => {
  it('renders a library module and service', () => {
    const result = renderTemplate(LibTemplate, { name: 'shared-auth' });

    expect(Object.keys(result).sort()).toEqual([
      'libs/shared-auth/index.ts',
      'libs/shared-auth/shared-auth-module.ts',
      'libs/shared-auth/shared-auth-service.ts',
    ]);
    expect(result['libs/shared-auth/shared-auth-module.ts']).toContain(
      'export class SharedAuthModule',
    );
    expect(result['libs/shared-auth/shared-auth-service.ts']).toContain(
      'export class SharedAuthService',
    );
  });
});
