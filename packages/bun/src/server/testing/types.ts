import type { BunServerOptions } from '../types';
import type { TestBunServer } from './test-bun-server';

export type TestBunServerFactory = (options: BunServerOptions) => TestBunServer;
