import type { Class, Fn } from '@bunito/common';
import type {
  ModuleSchema,
  ProviderClassSchema,
  ProviderHandlerSchema,
  ProviderScope,
  WithInjections,
} from '../types';

export type ClassDecorator<TPattern extends Class = Class> = <TTarget extends TPattern>(
  target: TTarget,
  context: ClassDecoratorContext,
) => TTarget;

export type ClassMethodDecorator<TPattern extends Fn = Fn> = <TTarget extends TPattern>(
  target: TTarget,
  context: ClassMethodDecoratorContext,
) => TTarget;

export type ClassOrClassMethodDecorator = <TTarget>(
  target: TTarget,
  context: ClassMethodDecoratorContext | ClassDecoratorContext,
) => TTarget;

export type ClassFieldDecorator = <TTarget>(
  target: TTarget,
  context: ClassFieldDecoratorContext,
) => TTarget;

export type ModuleDecoratorOptions = Omit<ModuleSchema, 'token'> &
  WithInjections<{
    scope?: Extract<ProviderScope, 'singleton' | 'module'>;
  }>;

export type ProviderDecoratorOptions = Omit<ProviderClassSchema, 'useClass'>;

export type ProviderHandlerDecoratorOptions = Omit<ProviderHandlerSchema, 'disposable'>;
