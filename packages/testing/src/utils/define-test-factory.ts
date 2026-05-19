import { TEST_FACTORIES } from '../constants';
import type { TestContext, TestFactory, TestKey } from '../types';

export function defineTestFactory<TKey extends TestKey>(
  key: TKey,
  factory: TestFactory<TestContext[TKey]>,
): void {
  TEST_FACTORIES.set(key, factory);
}
