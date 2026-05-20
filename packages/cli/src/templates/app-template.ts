import { join } from 'node:path';
import type { TemplateResult } from './types';

export function AppTemplate(options: { name?: string } = {}): TemplateResult {
  const { name } = options;

  return {
    [join('src', `app-module.ts`)]: `
      import { Module } from '@bunito/bunito';
      
      @Module({
        imports: [],
      })
      export class AppModule {}
    `,

    [join('src', `app-module.test.ts`)]: `
      import { describe, expect, test } from 'bun:test';
      import { AppModule } from './app-module';
      
      describe('AppModule', () => {
        test.todo('add unit tests', () => {
          expect(AppModule).toBeDefined();
        });
      });
    `,

    [join('src', `index.ts`)]: `
      export * from './app-module';
    `,

    [join('src', `main.ts`)]: `
      import { App } from '@bunito/bunito';
      import { AppModule } from './app-module';
      
      await App.start(AppModule);
    `,

    [join('test', `app.spec.ts`)]: `
      import { describe, expect, test } from 'bun:test';
      import { AppModule } from '@app${name ? `s/${name}` : ''}';
      
      describe('App', () => {
        test.todo('add integration tests', () => {
          expect(AppModule).toBeDefined();
        });
      });
    `,

    '.env': `
     # Add your environment variables here
    `,
  };
}
