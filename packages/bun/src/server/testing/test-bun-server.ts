import { mock } from 'bun:test';
import type { MockedObject } from '@bunito/testing';
import type { BunServer } from '../types';

export class TestBunServer implements MockedObject<Partial<BunServer>> {
  url: URL;

  constructor() {
    this.url = new URL('http://testing');
  }

  fetch = mock(async () => {
    return new Response('ok');
  });

  upgrade = mock(() => {
    return false;
  });

  publish = mock(() => {
    return 0;
  });

  stop = mock(async () => undefined);
}
