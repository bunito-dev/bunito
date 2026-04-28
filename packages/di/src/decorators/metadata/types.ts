import type { Class, Fn, RawObject } from '@bunito/common';

export type ClassPropKey = string | symbol;

export type ClassPropDecoratorContext =
  | ClassDecoratorContext
  | ClassMethodDecoratorContext
  | ClassFieldDecoratorContext;

type ClassPropDecoratorBaseMetadata<
  TPropKind extends ClassPropDecoratorContext['kind'],
  TOptions,
  TPropKey extends ClassPropKey | undefined = ClassPropKey,
> = {
  decorator: Fn;
  propKind: TPropKind;
  propKey: TPropKey;
  options: TOptions;
};

export type ClassPropDecoratorMetadata<
  TClassOptions = unknown,
  TFieldOptions = unknown,
  TMethodOptions = unknown,
> =
  | ClassPropDecoratorBaseMetadata<'class', TClassOptions, undefined>
  | ClassPropDecoratorBaseMetadata<'field', TFieldOptions>
  | ClassPropDecoratorBaseMetadata<'method', TMethodOptions>;

export type ClassHandlerDecoratorMetadata<TOptions = unknown> = {
  propKey: ClassPropKey;
  options: TOptions;
};

export type ClassHandlersDecoratorMetadata<TOptions = unknown> = Map<
  Fn,
  ClassHandlerDecoratorMetadata<TOptions>
>;

export type ClassDecoratorMetadataOptions = {
  class?: RawObject;
  handler?: unknown;
  propClass?: unknown;
  propField?: unknown;
  propMethod?: unknown;
};

export type ClassDecoratorMetadata<
  TOptions extends ClassDecoratorMetadataOptions = ClassDecoratorMetadataOptions,
> = {
  options?: TOptions['class'];
  handlers?: ClassHandlersDecoratorMetadata<TOptions['handler']>;
  props?: ClassPropDecoratorMetadata<
    TOptions['propClass'],
    TOptions['propField'],
    TOptions['propMethod']
  >[];
};

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
