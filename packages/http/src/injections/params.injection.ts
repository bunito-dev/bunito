import type { RawObject } from '@bunito/common';
import type { InjectionTokenOptions } from '@bunito/container/internals';
import type { ZodObject, z } from 'zod';

export type Params<TOptions extends RawObject<string> | ZodObject = RawObject<string>> =
  TOptions extends ZodObject ? z.infer<TOptions> : TOptions;

export function Params(options?: ZodObject): InjectionTokenOptions {
  return {
    useToken: Params,
    options,
  };
}
