import type { Fn } from '@bunito/common';
import type { ZodType } from 'zod';

export type ConfigKind = 'env' | 'value' | 'secret';

export type ConfigKeyLike<TKey extends string = string> = TKey | TKey[];

export type ConfigFormat =
  | 'string'
  | 'lowercase'
  | 'uppercase'
  | 'integer'
  | 'decimal'
  | 'port'
  | 'boolean';

export type ConfigParser<TOutput = unknown, TInput = unknown> =
  | Fn<TOutput, [TInput]>
  | ZodType<TOutput, TInput>;

export type ResolveConfigFormat<TFormat> = TFormat extends 'boolean'
  ? boolean
  : TFormat extends 'integer' | 'decimal' | 'port'
    ? number
    : string;

export type ResolveConfigParser<TParser = unknown> =
  TParser extends ZodType<infer TOutput>
    ? TOutput
    : TParser extends Fn<infer TOutput>
      ? TOutput
      : unknown;
