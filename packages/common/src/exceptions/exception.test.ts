import { describe, expect, it } from 'bun:test';
import { Exception } from './exception';

describe('Exception', () => {
  describe('isInstance', () => {
    class TestException extends Exception {}

    it('should return true for an instance of the exception', () => {
      expect(Exception.isInstance(new Exception('base error'))).toBeTrue();
    });

    it('should return true for an instance of a subclass of the exception', () => {
      expect(Exception.isInstance(new TestException('subclass error'))).toBeTrue();
    });

    it('should return false for an instance of a different class', () => {
      expect(Exception.isInstance(new Error())).toBeFalse();
      expect(Exception.isInstance('foo')).toBeFalse();
    });
  });

  describe('behavior', () => {
    it('should set the message', () => {
      const exception = new Exception('Test message');
      expect(exception.message).toBe('Test message');
    });

    it('should set the data', () => {
      const data = { foo: 'bar' };
      const exception = new Exception('Test message', data);
      expect(exception.data).toBe(data);
    });

    it('should set the stack trace', () => {
      const exception = new Exception('Test message');
      expect(exception.stack).toBeDefined();
    });

    it('should keep the default message when an empty string is provided', () => {
      const exception = new Exception('');

      expect(exception.name).toBe('UnknownException');
      expect(exception.message).toBe('Something went wrong!');
    });

    it('should set cause passed as the third argument', () => {
      const cause = new Error('root cause');
      const exception = new Exception('Message', undefined, cause);

      expect(exception.cause).toBe(cause);
    });

    it('should set message, data and cause from positional arguments', () => {
      const cause = new Error('root cause');
      const data = { code: 123 };
      const exception = new Exception('Failure', data, cause);

      expect(exception.message).toBe('Failure');
      expect(exception.data).toBe(data);
      expect(exception.cause).toBe(cause);
    });
  });
});
