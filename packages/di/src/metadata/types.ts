import type { Fn } from '@bunito/common';

export type ClassHandlerMetadata<TValue = unknown> = {
  propKey: PropertyKey;
  options: TValue;
};

export type ClassPropKind = 'class' | 'field' | 'method';
export type ClassPropOptionsSchema = Partial<Record<ClassPropKind, unknown>>;

export type ClassPropMetadata<
  TOptionsSchema extends ClassPropOptionsSchema = ClassPropOptionsSchema,
> =
  | {
      propKind: 'class';
      options: TOptionsSchema['class'];
    }
  | {
      propKind: 'field';
      propKey: PropertyKey;
      options: TOptionsSchema['field'];
    }
  | {
      propKind: 'method';
      propKey: PropertyKey;
      options: TOptionsSchema['method'];
    };

export type ClassMetadataKey = symbol | Fn;
export type ClassMetadataKind = 'options' | 'handler' | 'prop';

export type ClassMetadata<
  TValue = unknown,
  THandlerValue = unknown,
  TPropValueSchema extends ClassPropOptionsSchema = ClassPropOptionsSchema,
> = {
  options?: Map<ClassMetadataKey, TValue>;
  handlers?: Map<ClassMetadataKey, ClassHandlerMetadata<THandlerValue>>;
  props?: Map<ClassMetadataKey, ClassPropMetadata<TPropValueSchema>[]>;
};
