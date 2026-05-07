import { join } from 'node:path';
import { toPascalCase } from '#common';
import { PROJECT_SRC_DIR } from '#services';
import type { TemplateResult } from './types';

export function AppTemplate(options: { name?: string } = {}): TemplateResult {
  const { name } = options;

  const classPrefix = name ? toPascalCase(name) : undefined;

  const result =
    name && classPrefix
      ? {
          [join(PROJECT_SRC_DIR, `${name}.module.ts`)]: `
            import { LoggerModule, Module } from '@bunito/bunito';
            import { ${classPrefix}Service } from './${name}.service';
            
            @Module({
              imports: [LoggerModule],
              providers: [${classPrefix}Service],
            })
            export class ${classPrefix}Module {}
          `,

          [join(PROJECT_SRC_DIR, `${name}.service.ts`)]: `
            import { Provider } from '@bunito/bunito';
            
            @Provider()
            export class ${classPrefix}Service {}
          `,

          [join(PROJECT_SRC_DIR, `index.ts`)]: `
            export * from './${name}.module';
            export * from './${name}.service';
          `,

          [join(PROJECT_SRC_DIR, `main.ts`)]: `
            import { App } from '@bunito/bunito';
            import { ${classPrefix}Module } from './${name}.module';
            
            await App.start(${classPrefix}Module);
          `,
        }
      : {
          [join(PROJECT_SRC_DIR, `app.module.ts`)]: `
            import { LoggerModule, Module } from '@bunito/bunito';
            
            @Module({
              imports: [LoggerModule],
            })
            export class AppModule {}
          `,

          [join(PROJECT_SRC_DIR, `main.ts`)]: `
            import { App } from '@bunito/bunito';
            import { AppModule } from './app.module';
            
            await App.start(AppModule);
          `,
        };

  result['.env'] = `
    // Add your environment variables here
  `;

  return result;
}
