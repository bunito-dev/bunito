import { describe, expect, it } from 'bun:test';
import { spyOnObject } from './spy-on-object';

describe('spyOnObject', () => {
  it('spies on methods from an object prototype chain', () => {
    class Base {
      base(): string {
        return 'base';
      }
    }

    class Example extends Base {
      own(): string {
        return 'own';
      }
    }

    const obj = spyOnObject(new Example());

    expect(obj.base()).toBe('base');
    expect(obj.own()).toBe('own');
    expect(obj.base).toHaveBeenCalled();
    expect(obj.own).toHaveBeenCalled();
  });
});
