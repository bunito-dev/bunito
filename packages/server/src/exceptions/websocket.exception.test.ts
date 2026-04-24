import { describe, expect, it } from 'bun:test';
import { WebSocketException } from './websocket.exception';

describe('WebSocketException', () => {
  it('uses a websocket-specific exception name', () => {
    expect(new WebSocketException('boom').name).toBe('WebSocketException');
  });
});
