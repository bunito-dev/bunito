import type { TestBunServerFactory } from './types';

export function testBunServerFactory(this: Bunito.Test): TestBunServerFactory {
  return () => this.bunServer;
}
