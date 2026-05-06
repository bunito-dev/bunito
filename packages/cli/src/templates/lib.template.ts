import { join } from 'node:path';
import { PROJECT_DIRS } from '../project';
import type { TemplateResult } from './types';

export function LibTemplate(options: {
  name: string;
  classPrefix: string;
}): TemplateResult {
  const { name, classPrefix } = options;

  const rootPath = join(PROJECT_DIRS.libs, name);

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
      })
      export class ${classPrefix}Module {}
    `,

    [join(rootPath, `index.ts`)]: `
      export * from './${name}.module';
      export * from './${name}.service';
    `,
  };
}
