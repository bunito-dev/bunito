import type { FactoryProviderOptions } from '../container';

export type ResolveConfig<TValue> =
  TValue extends FactoryProviderOptions<infer TConfig> ? Awaited<TConfig> : TValue;

export type EnvParser<TValue> = (value: string) => TValue | undefined;
