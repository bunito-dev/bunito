import { mock } from 'bun:test';
import type { TestBunServerFactory } from './types';

export function testBunServerFactory(this: Bunito.Test): TestBunServerFactory {
  return mock((options) => this.bunServer.start(options));
}
