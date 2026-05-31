import { TEST_FACTORIES } from './constants';
import { TestException } from './test-exception';
import type { TestContext, TestKey } from './types';

export const Test = new Proxy({} as TestContext, {
  set(): boolean {
    throw new TestException('Cannot set property on test context');
  },

  get: (context: Record<PropertyKey, unknown>, key: TestKey) => {
    let value = context[key];

    if (value === undefined) {
      const factory = TEST_FACTORIES.get(key);

      if (!factory) {
        throw new TestException(`Test context key "${key}" is not defined`);
      }

      value = factory.apply(Test);
      context[key] = value;
    }

    return value;
  },
}) as TestContext;
