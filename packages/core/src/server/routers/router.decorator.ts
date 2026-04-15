import type { Class } from '@bunito/common';
import type { ExtensionDecoratorOptions } from '../../container';
import { createExtensionDecorator } from '../../container';
import { ROUTER_EXTENSION } from './constants';
import type { RouterExtension } from './router.extension';

export const Router = <TRouter extends Class<RouterExtension>>(
  options: ExtensionDecoratorOptions = {},
) =>
  createExtensionDecorator<string, TRouter>(ROUTER_EXTENSION, undefined, {
    scope: 'singleton',
    ...options,
  });
