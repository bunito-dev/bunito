import { describe, expect, it } from 'bun:test';
import { Id } from '@bunito/container';
import { RequestContext } from './request.context';

describe('RequestContext', () => {
  it('exposes request data, params, query values, and upgrade payloads', () => {
    const upgrades: unknown[] = [];
    const request = new Request('https://example.test/users/1?a=1&a=2&b=3', {
      method: 'POST',
      headers: {
        'x-test': 'yes',
      },
    }) as Request & { params: Record<string, string> };
    request.params = {
      id: '1',
    };
    const server = {
      upgrade: (receivedRequest: Request, options: unknown) => {
        upgrades.push([receivedRequest, options]);
        return true;
      },
    };
    const context = new RequestContext(
      Id.unique('Request'),
      request,
      '/users/:id',
      server as never,
      undefined,
    );

    expect(context.method).toBe('POST');
    expect(context.headers.get('x-test')).toBe('yes');
    expect(context.params).toEqual({ id: '1' });
    expect(context.query).toEqual({
      a: ['1', '2'],
      b: '3',
    });
    expect(context.query).toBe(context.query);
    expect(context.upgrade({ headers: { 'x-upgrade': 'yes' }, userId: 1 })).toBeTrue();
    expect(upgrades).toEqual([
      [
        request,
        {
          headers: {
            'x-upgrade': 'yes',
          },
          data: {
            userId: 1,
          },
        },
      ],
    ]);
  });

  it('uses empty params and upgrade data by default', () => {
    const upgrades: unknown[] = [];
    const request = new Request('https://example.test/');
    const context = new RequestContext(
      Id.unique('Request'),
      request,
      undefined,
      {
        upgrade: (_request: Request, options: unknown) => {
          upgrades.push(options);
          return false;
        },
      } as never,
      undefined,
    );

    expect(context.params).toEqual({});
    expect(context.upgrade()).toBeFalse();
    expect(upgrades).toEqual([
      {
        headers: undefined,
        data: {},
      },
    ]);
  });
});
