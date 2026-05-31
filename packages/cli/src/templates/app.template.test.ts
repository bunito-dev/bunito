import { describe, expect, it } from 'bun:test';
import { AppTemplate } from './app.template';

describe('AppTemplate', () => {
  it('describes root app files with app module names', () => {
    expect(AppTemplate({ name: 'demo', root: true })).toEqual({
      'src/app.module.ts': {
        view: 'app/module.ts',
        params: {
          moduleClass: 'AppModule',
        },
      },
      'src/app.module.test.ts': {
        view: 'app/module.test.ts',
        params: {
          moduleName: 'app.module',
          moduleClass: 'AppModule',
        },
      },
      'src/index.ts': {
        view: 'app/index.ts',
        params: {
          moduleName: 'app.module',
        },
      },
      'src/main.ts': {
        view: 'app/main.ts',
        params: {
          moduleName: 'app.module',
          moduleClass: 'AppModule',
        },
      },
      '.env': {
        view: 'app/.env',
      },
      'README.md': null,
    });
  });

  it('describes workspace app files with kebab module names', () => {
    expect(AppTemplate({ name: 'admin-api', root: false })).toMatchObject({
      'src/admin-api.module.ts': {
        params: {
          moduleClass: 'AdminApiModule',
        },
      },
      'src/admin-api.module.test.ts': {
        params: {
          moduleName: 'admin-api.module',
          moduleClass: 'AdminApiModule',
        },
      },
      'README.md': {
        view: 'app/README.md',
        params: {
          name: 'admin-api',
          root: false,
        },
      },
    });
  });
});
