import { mock } from 'bun:test';
import type { MockedObject } from '@bunito/testing';
import type { Server } from '../types';

export class TestServer implements MockedObject<Partial<Server>> {
  url = new URL('http://testing');

  fetch = mock(async () => {
    return new Response('ok');
  });

  upgrade = mock(() => {
    return false;
  });

  publish = mock(() => {
    return 0;
  });

  stop = mock(async () => {
    //
  });
}
