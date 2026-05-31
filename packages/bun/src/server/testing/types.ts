import type { Mock } from 'bun:test';
import type { BunRouteHandler, BunServerFactory } from '../types';

export type TestBunServerFactory = Mock<BunServerFactory>;

export type TestBunRouteMatch = {
  path: string;
  params: Record<string, string>;
  score: number;
  handler: BunRouteHandler;
};
