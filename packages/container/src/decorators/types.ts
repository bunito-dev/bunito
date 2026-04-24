import type { Class, Fn } from '@bunito/common';
import type { ModuleOptions, ProviderClassOptions, ProviderEvents } from '../types';
import type { DECORATOR_METADATA_KEYS } from './constants';

export type ClassDecorator<TPattern extends Class = Class> = <TTarget extends TPattern>(
  target: TTarget,
  context: ClassDecoratorContext,
) => TTarget;

export type ClassFieldDecorator<TPattern = unknown> = <TTarget extends TPattern>(
  target: TTarget,
  context: ClassFieldDecoratorContext,
) => TTarget;

export type ClassPropDecorator<TPattern = unknown> = <TTarget extends TPattern>(
  target: TTarget,
  context: ClassFieldDecoratorContext | ClassMethodDecoratorContext,
) => TTarget;

export type ClassMethodDecorator<TPattern extends Fn = Fn> = <TTarget extends TPattern>(
  target: TTarget,
  context: ClassFieldDecoratorContext | ClassMethodDecoratorContext,
) => TTarget;

export type DecoratorMetadataKind = keyof typeof DECORATOR_METADATA_KEYS;

export type ProviderDecoratorOptions<TOmit extends keyof ProviderClassOptions = never> =
  Omit<ProviderClassOptions, 'useClass' | TOmit>;

export type ProviderMetadata = {
  options?: ProviderDecoratorOptions;
  events?: ProviderEvents;
};

export type ModuleDecoratorOptions = ModuleOptions &
  Pick<ProviderDecoratorOptions, 'injects'>;

export type ExtensionMetadata<TOptions = unknown> = {
  key: symbol;
  options: TOptions;
};
