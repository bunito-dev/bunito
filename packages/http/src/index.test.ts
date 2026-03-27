import { describe, expect, it } from 'bun:test';
import * as http from './index';

describe('http index exports', () => {
  it('should re-export the main public API', () => {
    expect(http.HttpModule).toBeDefined();
    expect(http.HttpService).toBeDefined();
    expect(http.httpConfig).toBeDefined();
    expect(http.HttpException).toBeDefined();
    expect(http.Route).toBeDefined();
    expect(http.Get).toBeDefined();
    expect(http.Post).toBeDefined();
  });
});
