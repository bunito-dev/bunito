// biome-ignore lint/suspicious/noExplicitAny: Internal usage only
export type Any = any;

export type Class<TInstance = unknown, TArgs extends Array<Any> = Array<Any>> = new (
  ...args: TArgs
) => TInstance;

export type Fn<TResult = unknown, TArgs extends Array<Any> = Array<Any>> = (
  ...args: TArgs
) => TResult;

export type Optional<TObject, TKey extends keyof TObject> = Partial<Pick<TObject, TKey>> &
  Omit<TObject, TKey>;

export type Mandatory<TObject, TKey extends keyof TObject> = Required<
  Pick<TObject, TKey>
> &
  Omit<TObject, TKey>;
