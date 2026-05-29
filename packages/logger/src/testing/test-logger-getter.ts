import { Id } from '@bunito/container';
import { TestException } from '@bunito/testing';
import { TestLogger } from './test-logger';
import type { TestLoggerGetter } from './types';

export function testLoggerGetter(): TestLoggerGetter {
  return (context) => {
    const contextId = context ? Id.for(context) : null;
    const logger = TestLogger.getInstance(contextId);

    if (!logger) {
      return TestException.throw`No logger found for context ${contextId}`;
    }

    return logger;
  };
}
