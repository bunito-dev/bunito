import { Id } from '@bunito/container';
import { defineTestFactory, TestException } from '@bunito/testing';
import { Logger } from '../logger';
import { LoggerModule } from '../logger-module';
import { TestLogger } from './test-logger';

defineTestFactory('LoggerModule', () => ({
  token: LoggerModule,
  providers: [TestLogger],
  exports: [Logger],
}));

defineTestFactory('getLogger', () => (context) => {
  const contextId = context ? Id.for(context) : null;
  const logger = TestLogger.getInstance(contextId);

  if (!logger) {
    return TestException.throw`No logger found for context ${contextId}`;
  }

  return logger;
});
