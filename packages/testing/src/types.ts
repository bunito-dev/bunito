import type { Mock } from 'bun:test';
import type { Fn } from '@bunito/common';

export type TestKey = keyof Bunito.Test;

export type TestContext = Readonly<{
  [TKey in TestKey]: NonNullable<Bunito.Test[TKey]>;
}>;

export type TestFactory<TValue = unknown> = (this: TestContext) => TValue;

export type MockedObject<TObj extends object> = {
  [TKey in keyof TObj]: TObj[TKey] extends Fn ? Mock<TObj[TKey]> : TObj[TKey];
};

export type SpiedObject<TObj extends object> = MockedObject<TObj>;
