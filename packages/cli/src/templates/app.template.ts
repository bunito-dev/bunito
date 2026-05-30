import { toPascalCase } from '../common';
import type { TemplateViews } from './types';

export function AppTemplate(options: { name: string; root: boolean }): TemplateViews {
  const { name, root } = options;

  const moduleName = `${root ? 'app' : name}.module`;
  const moduleClass = `${root ? 'App' : toPascalCase(name)}Module`;

  return {
    [`src/${moduleName}.ts`]: {
      view: 'app/module.ts',
      params: {
        moduleClass,
      },
    },
    [`src/${moduleName}.test.ts`]: {
      view: 'app/module.test.ts',
      params: {
        moduleName,
        moduleClass,
      },
    },
    'src/index.ts': {
      view: 'app/index.ts',
      params: {
        moduleName,
      },
    },
    'src/main.ts': {
      view: 'app/main.ts',
      params: {
        moduleName,
        moduleClass,
      },
    },
    [`test/${moduleName}.spec.ts`]: {
      view: 'app/module.spec.ts',
      params: {
        moduleClass,
        root,
        name,
      },
    },
    '.env': {
      view: 'app/.env',
    },
    'README.md': root
      ? null
      : {
          view: 'app/README.md',
          params: {
            name,
            root,
          },
        },
  };
}
