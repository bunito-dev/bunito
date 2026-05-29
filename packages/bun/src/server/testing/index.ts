import './globals';

import { defineTestFactory } from '@bunito/testing';
import { TestBunServer } from './test-bun-server';
import { testBunServerFactory } from './test-bun-server-factory';
import { testBunServerModule } from './test-bun-server-module';

defineTestFactory('BunServerModule', testBunServerModule);
defineTestFactory('bunServerFactory', testBunServerFactory);
defineTestFactory('bunServer', () => new TestBunServer());
