import type { Mock } from 'bun:test';
import { mock } from 'bun:test';
import type { ContextId } from '@bunito/container';
import { CONTEXT_ID, Provider } from '@bunito/container';
import type { SpiedObject } from '@bunito/testing';
import { Logger } from '../logger';
import type { LoggerInstance } from '../logger-instance';

@Provider({
  token: Logger,
  scope: 'transient',
  global: true,
  injects: [CONTEXT_ID],
})
export class TestLogger implements SpiedObject<LoggerInstance> {
  private static readonly instances = new Map<ContextId | null, TestLogger>();

  static getInstance(contextId: ContextId | null): TestLogger | undefined {
    return TestLogger.instances.get(contextId);
  }

  constructor(contextId: ContextId | null = null) {
    TestLogger.instances.getOrInsertComputed(contextId, () => this);
  }

  fatal: Mock<LoggerInstance['fatal']> = mock();

  error: Mock<LoggerInstance['error']> = mock();

  warn: Mock<LoggerInstance['warn']> = mock();

  info: Mock<LoggerInstance['info']> = mock();

  ok: Mock<LoggerInstance['ok']> = mock();

  verbose: Mock<LoggerInstance['verbose']> = mock();

  debug: Mock<LoggerInstance['debug']> = mock();

  track = mock((_context?: string) => {
    return this;
  });
}
