// biome-ignore lint/suspicious/noExplicitAny: Internal usage only
export type Any = any;

export type Class<TInstance = Any, TArgs extends Any[] = Any[]> = new (
  ...args: TArgs
) => TInstance;

export type Fn<TResult = Any, TArgs extends Any[] = Any[]> = (...args: TArgs) => TResult;

export type Optional<TObject, TKey extends keyof TObject> = Partial<Pick<TObject, TKey>> &
  Omit<TObject, TKey>;

export type Mandatory<TObject, TKey extends keyof TObject> = Required<
  Pick<TObject, TKey>
> &
  Omit<TObject, TKey>;

export type StripUndefined<TValue> = Exclude<TValue, undefined>;

export type EmptyFallback<TValue, TFallback> = [TValue] extends [never]
  ? TFallback
  : TValue;

export type ResolveField<TValue, TKey extends PropertyKey> = TValue extends object
  ? TKey extends keyof TValue
    ? TValue[TKey]
    : undefined
  : undefined;

export type CallableInstance<TResult = unknown> = Record<PropertyKey, Fn<TResult>>;

export type MaybePromise<TValue = unknown> = Promise<TValue> | TValue;
