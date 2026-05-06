import { join } from 'node:path';
import { PROJECT_DIRS } from '../project';
import type { TemplateResult } from './types';

export function AppTemplate(
  options: { name?: string; classPrefix?: string } = {},
): TemplateResult {
  const { name, classPrefix } = options;

  const result =
    name && classPrefix
      ? {
          [join(PROJECT_DIRS.src, `${name}.service.ts`)]: `
          import { Provider } from '@bunito/bunito';
          
          @Provider()
          export class ${classPrefix}Service {}
        `,

          [join(PROJECT_DIRS.src, `${name}.module.ts`)]: `
          import { Module } from '@bunito/bunito';
          import { ${classPrefix}Service } from './${name}.service';
          
          @Module({
            providers: [${classPrefix}Service],
          })
          export class ${classPrefix}Module {}
        `,

          [join(PROJECT_DIRS.src, `main.ts`)]: `
          import { App, LoggerModule } from '@bunito/bunito';
          import { ${classPrefix}Module } from './${name}.module';
          
          await App.start({
            imports: [LoggerModule, ${classPrefix}Module],
          });
        `,
        }
      : {
          [join(PROJECT_DIRS.src, `main.ts`)]: `
          import { App, LoggerModule } from '@bunito/bunito';
          
          await App.start({
            imports: [LoggerModule],
          });
        `,
        };

  result['.env'] = `
    // Add your environment variables here
  `;

  return result;
}
