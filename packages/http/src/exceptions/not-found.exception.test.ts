import { describe, expect, it } from 'bun:test';
import { NotFoundException } from './not-found.exception';

describe('NotFoundException', () => {
  it('uses the not found status code', () => {
    expect(new NotFoundException().statusCode).toBe(404);
  });
});
