import { describe, expect, it } from 'bun:test';
import { LibTemplate } from './lib.template';

describe('LibTemplate', () => {
  it('describes module, service, test, and README files', () => {
    expect(LibTemplate({ name: 'shared-auth' })).toEqual({
      'src/shared-auth.module.ts': {
        view: 'lib/module.ts',
        params: {
          moduleClass: 'SharedAuthModule',
          serviceClass: 'SharedAuthService',
          serviceName: 'shared-auth.service',
        },
      },
      'src/shared-auth.module.test.ts': {
        view: 'lib/module.test.ts',
        params: {
          moduleClass: 'SharedAuthModule',
          moduleName: 'shared-auth.module',
        },
      },
      'src/shared-auth.service.ts': {
        view: 'lib/service.ts',
        params: {
          serviceClass: 'SharedAuthService',
        },
      },
      'src/shared-auth.service.test.ts': {
        view: 'lib/service.test.ts',
        params: {
          serviceClass: 'SharedAuthService',
          serviceName: 'shared-auth.service',
        },
      },
      'test/shared-auth.module.spec.ts': {
        view: 'lib/module.spec.ts',
        params: {
          name: 'shared-auth',
          moduleClass: 'SharedAuthModule',
        },
      },
      'src/index.ts': {
        view: 'lib/index.ts',
        params: {
          moduleName: 'shared-auth.module',
          serviceName: 'shared-auth.service',
        },
      },
      'README.md': {
        view: 'lib/README.md',
        params: {
          name: 'shared-auth',
          moduleClass: 'SharedAuthModule',
          serviceClass: 'SharedAuthService',
        },
      },
    });
  });
});
