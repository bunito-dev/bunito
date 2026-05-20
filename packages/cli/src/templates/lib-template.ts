import { join } from 'node:path';
import { toPascalCase } from '../common';
import type { TemplateResult } from './types';

export function LibTemplate(options: { name: string }): TemplateResult {
  const { name } = options;

  const classPrefix = name ? toPascalCase(name) : undefined;

  const moduleName = `${name}-module`;
  const moduleClass = `${classPrefix}Module`;
  const serviceName = `${name}-service`;
  const serviceClass = `${classPrefix}Service`;

  return {
    [join('src', `${moduleName}.ts`)]: `
      import { Module } from '@bunito/bunito';
      import { ${serviceClass} } from './${serviceName}';
      
      @Module({
        providers: [${serviceClass}],
        exports: [${serviceClass}],
      })
      export class ${moduleClass} {}
    `,

    [join('src', `${moduleName}.test.ts`)]: `
      import { describe, expect, test } from 'bun:test';
      import { ${moduleClass} } from './${moduleName}';
      
      describe('${moduleClass}', () => {
        test.todo('add integration tests', () => {
          expect(${moduleClass}).toBeDefined();
        });
      });
    `,

    [join('src', `${serviceName}.ts`)]: `
      import { Provider } from '@bunito/bunito';
      
      @Provider()
      export class ${serviceClass} {}
    `,

    [join('src', `${serviceName}.test.ts`)]: `
      import { describe, expect, test } from 'bun:test';
      import { ${serviceClass} } from './${serviceName}';
      
      describe('${serviceClass}', () => {
        test.todo('add integration tests', () => {
          expect(${serviceClass}).toBeDefined();
        });
      });
    `,

    [join('src', `index.ts`)]: `
      export * from './${moduleName}';
      export * from './${serviceName}';
    `,

    [join('test', `${name}.spec.ts`)]: `
      import { describe, expect, test } from 'bun:test';
      import { ${moduleClass}, ${serviceClass} } from '@libs/${name}';
      
      describe('${name}', () => {
        test.todo('add integration tests', () => {
          expect(${moduleClass}).toBeDefined();
          expect(${serviceClass}).toBeDefined();
        });
      });
    `,
  };
}
