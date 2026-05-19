import { defineTestFactory } from '@bunito/testing';
import { SERVER_FACTORY_ID } from '../constants';
import { ServerService } from '../server-service';
import { TestServer } from './test-server';

defineTestFactory('ServerModule', function TestServerModule() {
  return {
    providers: [
      ServerService,
      {
        token: SERVER_FACTORY_ID,
        useValue: this.serverFactory,
      },
    ],
    exports: [ServerService],
  };
});

defineTestFactory('serverFactory', function testServerFactory() {
  return () => this.server;
});

defineTestFactory('server', () => new TestServer());
