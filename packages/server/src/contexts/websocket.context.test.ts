import { describe, expect, it } from 'bun:test';
import { WebSocketContext } from './websocket.context';

describe('WebSocketContext', () => {
  it('exposes websocket event, socket, and socket data', () => {
    const socket = {
      data: {
        userId: 1,
      },
    };
    const event = {
      name: 'open' as const,
    };

    const context = new WebSocketContext(event, socket as never);

    expect(context.event).toBe(event);
    expect(context.socket).toBe(socket as never);
    expect(context.data).toEqual({
      userId: 1,
    });
  });
});
