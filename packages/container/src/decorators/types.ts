import type { Any, Class, Fn, MaybePromise } from '@bunito/common';
import type {
  ComponentOptions,
  ModuleOptions,
  ProviderClassOptions,
  ProviderHandlerOptions,
  ProviderScope,
  WithInjections,
} from '../compiler';

export type ClassPropDecoratorContext =
  | ClassMethodDecoratorContext
  | ClassFieldDecoratorContext
  | ClassDecoratorContext;

export type ClassDecorator<TInstance = Any> = <TTarget extends Class<TInstance>>(
  target: TTarget,
  context: ClassDecoratorContext,
) => TTarget;

export type ClassPropDecorator = <TTarget>(
  target: TTarget,
  context: ClassPropDecoratorContext,
) => TTarget;

export type ClassMethodDecorator<TPattern extends Fn = Fn> = <TTarget extends TPattern>(
  target: TTarget,
  context: ClassMethodDecoratorContext,
) => TTarget;

export type ClassFieldDecorator = <TTarget>(
  target: TTarget,
  context: ClassFieldDecoratorContext,
) => TTarget;

export type ModuleDecoratorOptions = ModuleMetadata &
  WithInjections<{
    scope?: Extract<ProviderScope, 'singleton' | 'module'>;
  }>;

export type ModuleMetadata = Omit<ModuleOptions, 'token'>;

export type ProviderDecoratorOptions = Omit<ProviderClassOptions, 'useClass' | 'token'>;

export type ProviderHandlerDecorator = ClassMethodDecorator<Fn<MaybePromise<void>>>;
export type ProviderHandlerDecoratorOptions = WithInjections;

export type ProviderMetadata = {
  decorator?: Fn;
  options?: ProviderDecoratorOptions;
  handlers?: Map<Fn, ProviderHandlerOptions>;
};

export type ComponentMetadata = Map<Fn, ComponentOptions>;

export type ExtensionDecorator<TExtension> = ClassDecorator<TExtension>;
