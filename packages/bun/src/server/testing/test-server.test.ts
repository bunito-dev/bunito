import { describe, expect, it } from 'bun:test';
import { TestServer } from './test-server';

describe('TestServer', () => {
  it('provides mocked Bun server methods', async () => {
    const server = new TestServer();

    const response = await server.fetch();

    expect(response).toEqual(new Response('ok'));
    expect(server.upgrade()).toBeFalse();
    expect(server.publish()).toBe(0);
    await server.stop();

    expect(server.url.href).toBe('http://testing/');
    expect(server.fetch).toHaveBeenCalled();
    expect(server.upgrade).toHaveBeenCalled();
    expect(server.publish).toHaveBeenCalled();
    expect(server.stop).toHaveBeenCalled();
  });
});
