import type { InjectionTokenOptions } from '@bunito/container/internals';
import type { ZodObject, z } from 'zod';
import type { HTTPQuery } from '../types';

export type Query<TOptions extends HTTPQuery | ZodObject = HTTPQuery> =
  TOptions extends ZodObject ? z.infer<TOptions> : TOptions;

export function Query(options?: ZodObject): InjectionTokenOptions {
  return {
    useToken: Query,
    options,
  };
}
