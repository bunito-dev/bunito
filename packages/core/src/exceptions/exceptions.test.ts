import { describe, expect, it } from 'bun:test';
import { ConfigurationException, InternalException, RuntimeException } from './index';

describe('core exceptions', () => {
  it('should expose the expected exception names and inheritance chain', () => {
    const cause = new Error('root cause');
    const internal = new InternalException('internal failure', { internal: true }, cause);
    const configuration = new ConfigurationException('bad config');
    const runtime = new RuntimeException('runtime failure');

    expect(internal.name).toBe('InternalException');
    expect(internal.message).toBe('internal failure');
    expect(internal.data).toEqual({ internal: true });
    expect(internal.cause).toBe(cause);

    expect(configuration.name).toBe('ConfigurationException');
    expect(configuration.message).toBe('bad config');
    expect(configuration).toBeInstanceOf(InternalException);

    expect(runtime.name).toBe('RuntimeException');
    expect(runtime.message).toBe('runtime failure');
    expect(runtime).toBeInstanceOf(InternalException);
  });
});
