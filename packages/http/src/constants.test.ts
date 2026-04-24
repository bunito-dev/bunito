import { describe, expect, it } from 'bun:test';
import { CONTROLLER_COMPONENT, MIDDLEWARE_EXTENSION } from './constants';

describe('http constants', () => {
  it('exposes component and extension symbols', () => {
    expect(CONTROLLER_COMPONENT).toBeSymbol();
    expect(MIDDLEWARE_EXTENSION).toBeSymbol();
    expect(CONTROLLER_COMPONENT).not.toBe(MIDDLEWARE_EXTENSION);
  });
});
