import { describe, expect, it } from 'bun:test';
import { Exception } from './exception';

class ExampleException extends Exception {
  constructor(message?: string, cause?: unknown) {
    super(message, cause);
    this.name = 'ExampleException';
  }
}

class OtherException extends Exception {
  constructor(message?: string, cause?: unknown) {
    super(message, cause);
    this.name = 'OtherException';
  }
}

describe('Exception', () => {
  it('uses the fallback message and stores an optional cause', () => {
    const cause = new Error('cause');
    const defaultError = new ExampleException();
    const causedError = new ExampleException('Failed', cause);

    expect(defaultError.message).toBe('Unknown exception');
    expect(defaultError.name).toBe('ExampleException');
    expect(causedError.message).toBe('Failed');
    expect(causedError.cause).toBe(cause);
  });

  it('checks concrete exception instances', () => {
    const error = new ExampleException('Boom');

    expect(ExampleException.isInstance(error)).toBeTrue();
    expect(OtherException.isInstance(error)).toBeFalse();
    expect(ExampleException.isInstance(new Error('Boom'))).toBeFalse();
  });

  it('throws formatted messages with inspected values', () => {
    let error: unknown;

    try {
      ExampleException.throw`Cannot handle ${Symbol.for('token')} in ${[
        'Root',
        'Feature',
      ]}`;
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(ExampleException);
    expect((error as Error).message).toBe('Cannot handle token in Root → Feature');
  });

  it('rejects formatted messages with concrete exception instances', async () => {
    let error: unknown;

    try {
      await ExampleException.reject`Missing ${class Service {}}`;
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(ExampleException);
    expect((error as Error).message).toBe('Missing Service');
  });
});
