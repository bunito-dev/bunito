import type { Class, Fn } from '@bunito/common';

export type Token<TValue = unknown> =
  | string
  | symbol
  | object
  | Fn<TValue>
  | Class<TValue>;

export type TokenLike =
  | Token
  | {
      token: Token;
    };

export type ResolveToken<TToken> =
  TToken extends Class<infer TInstance>
    ? TInstance
    : TToken extends Fn<infer TResult>
      ? TResult
      : never;
