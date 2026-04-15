import type { Class } from '@bunito/common';
import type { ExtensionDecoratorOptions } from '../../container';
import { createExtensionDecorator } from '../../container';
import { FORMATTER_EXTENSION } from './constants';
import type { FormatterExtension } from './formatter.extension';

export const Formatter = <TFormatter extends Class<FormatterExtension>>(
  name: string,
  options: ExtensionDecoratorOptions = {},
) =>
  createExtensionDecorator<string, TFormatter>(FORMATTER_EXTENSION, name.toLowerCase(), {
    scope: 'singleton',
    ...options,
  });
