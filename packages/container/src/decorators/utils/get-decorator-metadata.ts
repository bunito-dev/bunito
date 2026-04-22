import type { Class } from '@bunito/common';
import type { ClassPropDefinition, ModuleOptions } from '../../types';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type {
  ComponentMetadata,
  DecoratorMetadataKind,
  ExtensionMetadata,
  ProviderMetadata,
} from '../types';

export function getDecoratorMetadata<TOptions = unknown>(
  target: Class,
  kind: 'classOptions',
): Map<symbol, TOptions[]> | undefined;
export function getDecoratorMetadata<TFieldOptions = unknown, TMethodOptions = unknown>(
  target: Class,
  kind: 'classProps',
): Map<symbol, ClassPropDefinition<TFieldOptions, TMethodOptions>[]> | undefined;
export function getDecoratorMetadata<TOptions = unknown>(
  target: Class,
  kind: 'component',
): ComponentMetadata<TOptions> | undefined;
export function getDecoratorMetadata<TOptions = unknown>(
  target: Class,
  kind: 'extension',
): ExtensionMetadata<TOptions> | undefined;
export function getDecoratorMetadata(
  target: Class,
  kind: 'module',
): ModuleOptions | undefined;
export function getDecoratorMetadata(
  target: Class,
  kind: 'provider',
): ProviderMetadata | undefined;
export function getDecoratorMetadata(
  target: Class,
  kind: DecoratorMetadataKind,
): unknown {
  return target[Symbol.metadata ?? Symbol.for('Symbol.metadata')]?.[
    DECORATOR_METADATA_KEYS[kind]
  ];
}
