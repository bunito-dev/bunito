import { describe, expect, it } from 'bun:test';
import { NotFoundException } from './not-found.exception';

describe('NotFoundException', () => {
  it('creates a 404 HTTP exception', () => {
    expect(new NotFoundException().status).toBe(404);
  });
});
