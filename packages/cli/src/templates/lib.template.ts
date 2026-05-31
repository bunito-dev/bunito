import { toPascalCase } from '../common';
import type { TemplateViews } from './types';

export function LibTemplate(options: { name: string }): TemplateViews {
  const { name } = options;

  const classPrefix = toPascalCase(name);

  const moduleName = `${name}.module`;
  const moduleClass = `${classPrefix}Module`;
  const serviceName = `${name}.service`;
  const serviceClass = `${classPrefix}Service`;

  return {
    [`src/${moduleName}.ts`]: {
      view: 'lib/module.ts',
      params: {
        moduleClass,
        serviceClass,
        serviceName,
      },
    },
    [`src/${moduleName}.test.ts`]: {
      view: 'lib/module.test.ts',
      params: {
        moduleClass,
        moduleName,
      },
    },
    [`src/${serviceName}.ts`]: {
      view: 'lib/service.ts',
      params: {
        serviceClass,
      },
    },
    [`src/${serviceName}.test.ts`]: {
      view: 'lib/service.test.ts',
      params: {
        serviceClass,
        serviceName,
      },
    },
    'src/index.ts': {
      view: 'lib/index.ts',
      params: {
        moduleName,
        serviceName,
      },
    },
    'README.md': {
      view: 'lib/README.md',
      params: {
        name,
        moduleClass,
        serviceClass,
      },
    },
  } satisfies TemplateViews;
}
