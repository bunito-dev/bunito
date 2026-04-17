import type { Class } from '@bunito/common';
import type { ExtensionDecoratorOptions } from '@bunito/container';
import { createExtensionDecorator } from '@bunito/container';
import { ROUTER_EXTENSION } from './constants';
import type { RouterExtension } from './router.extension';

export const Router = <TRouter extends Class<RouterExtension>>(
  options: ExtensionDecoratorOptions = {},
) =>
  createExtensionDecorator<string, TRouter>(ROUTER_EXTENSION, undefined, {
    scope: 'singleton',
    ...options,
  });
