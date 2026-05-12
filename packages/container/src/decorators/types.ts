import type { Any, Class, Fn, MaybePromise } from '@bunito/common';
import type {
  ModuleOptions,
  ProviderClassOptions,
  ProviderHandlerOptions,
  WithInjections,
} from '../compiler';
import type { CLASS_METADATA_KEYS } from './constants';

export type ModuleMetadata = Omit<ModuleOptions, 'token'>;

export type ProviderDecoratorOptionsKey = Exclude<keyof ProviderClassOptions, 'useClass'>;
export type ProviderDecoratorOptions<TOmit extends ProviderDecoratorOptionsKey = never> =
  Omit<ProviderClassOptions, 'useClass' | TOmit>;

export type ProviderHandlerDecorator = ClassMethodDecorator<Fn<MaybePromise<void>>>;
export type ProviderHandlerDecoratorOptions = WithInjections;

export type ProviderMetadata = {
  decorator?: Fn;
  options?: ProviderDecoratorOptions;
  handlers?: Map<Fn, ProviderHandlerOptions>;
};

export type ExtensionDecorator<TExtension> = ClassDecorator<TExtension>;

export type ControllerClassOptions = {
  kind: 'prefix';
  prefix: string;
};

// classes

export type ClassMetadataKind = keyof typeof CLASS_METADATA_KEYS;

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

export type ClassPropKey = string | symbol;

export type ClassPropMetadata<
  TClassOptions = unknown,
  TFieldOptions = unknown,
  TMethodOptions = unknown,
> =
  | {
      propKind: 'class';
      options: TClassOptions;
    }
  | {
      propKey: ClassPropKey;
      propKind: 'field';
      options: TFieldOptions;
    }
  | {
      propKey: ClassPropKey;
      propKind: 'method';
      options: TMethodOptions;
    };

export type ClassPropsMetadata = Map<symbol, ClassPropMetadata[]>;
