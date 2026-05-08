import { join } from 'node:path';
import { toPascalCase } from '#common';
import { PROJECT_LIBS_DIR } from '#services';
import type { TemplateResult } from './types';

export function LibTemplate(options: { name: string }): TemplateResult {
  const { name } = options;

  const classPrefix = name ? toPascalCase(name) : undefined;

  const rootPath = join(PROJECT_LIBS_DIR, name);

  return {
    [join(rootPath, `${name}.service.ts`)]: `
      import { Provider } from '@bunito/bunito';
      
      @Provider()
      export class ${classPrefix}Service {}
    `,

    [join(rootPath, `${name}.module.ts`)]: `
      import { Module } from '@bunito/bunito';
      import { ${classPrefix}Service } from './${name}.service';
      
      @Module({
        providers: [${classPrefix}Service],
        exports: [${classPrefix}Service],
      })
      export class ${classPrefix}Module {}
    `,

    [join(rootPath, `index.ts`)]: `
      export * from './${name}.module';
      export * from './${name}.service';
    `,
  };
}
