import { join } from 'node:path';
import { PROJECT_SRC_DIR } from '../services';
import type { TemplateResult } from './types';

export function AppTemplate(): TemplateResult {
  return {
    [join(PROJECT_SRC_DIR, `app-module.ts`)]: `
      import { LoggerModule, Module } from '@bunito/bunito';
      
      @Module({
        imports: [LoggerModule],
      })
      export class AppModule {}
    `,

    [join(PROJECT_SRC_DIR, `main.ts`)]: `
      import { App } from '@bunito/bunito';
      import { AppModule } from './app-module';
      
      await App.start(AppModule);
    `,

    [join(PROJECT_SRC_DIR, `index.ts`)]: `
      export * from './app.module';
    `,

    '.env': `
      # Add your environment variables here
    `,
  };
}
