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

export type CallableInstance<TResult = unknown> = Record<PropertyKey, Fn<TResult>>;

export type MaybePromise<TValue = unknown> = Promise<TValue> | TValue;

export type RawObject<TValue = unknown> = Record<string, TValue>;

export type EmptyObject = Record<never, never>;

export type WithBase<
  TBase extends RawObject,
  T1 extends RawObject,
  T2 extends RawObject,
  T3 extends RawObject = never,
  T4 extends RawObject = never,
  T5 extends RawObject = never,
> = (T1 & TBase) | (T2 & TBase) | (T3 & TBase) | (T4 & TBase) | (T5 & TBase);
