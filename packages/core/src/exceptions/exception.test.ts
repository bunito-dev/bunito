import { describe, expect, it } from 'bun:test';
import { Exception } from './exception';
import { RuntimeException } from './runtime.exception';

describe('Exception', () => {
  it('captures and rejects exception variants', async () => {
    const cause = new Error('boom');
    const generic = new Exception('Message', { ok: true }, cause);

    expect(Exception.isInstance(generic)).toBe(true);
    expect(Exception.capture(generic)).toBe(generic);
    expect(Exception.capture(cause)).toMatchObject({
      message: 'boom',
      cause,
    });
    expect(Exception.capture('plain error')).toMatchObject({
      message: 'plain error',
    });
    expect(Exception.capture({ any: 'value' })).toMatchObject({
      message: 'Unknown Exception',
      cause: { any: 'value' },
    });

    expect(RuntimeException.reject('Rejected')).rejects.toMatchObject({
      name: 'RuntimeException',
      message: 'Rejected',
    });
  });
});
