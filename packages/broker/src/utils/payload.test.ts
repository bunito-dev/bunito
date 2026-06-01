import { describe, expect, it } from 'bun:test';
import { Payload } from './payload';

describe('Payload', () => {
  it('wraps raw bytes, encoded values, and existing payloads', () => {
    const encoded = Payload.encode({
      id: 1,
    });
    const fromValue = Payload.create({
      ok: true,
    });
    const fromBytes = Payload.create(encoded.data);
    const fromPayload = Payload.create(fromValue);

    expect(encoded.decode<{ id: number }>()).toEqual({
      id: 1,
    });
    expect(fromBytes.decode<{ id: number }>()).toEqual({
      id: 1,
    });
    expect(fromValue.decode<{ ok: boolean }>()).toEqual({
      ok: true,
    });
    expect(fromPayload).toBe(fromValue);
  });
});
