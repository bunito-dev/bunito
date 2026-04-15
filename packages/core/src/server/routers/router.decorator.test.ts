import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../../container';
import { ROUTER_EXTENSION } from './constants';
import { Router } from './router.decorator';

describe('Router', () => {
  it('stores router extension metadata', () => {
    class RouterTarget {
      processFetchRequest(): Response | undefined {
        return;
      }
    }

    const metadata = {} as DecoratorMetadata;

    Router({ injects: ['config'] })(RouterTarget, { metadata } as never);

    expect(metadata[DECORATOR_METADATA_KEYS.EXTENSION_KEY]).toBe(ROUTER_EXTENSION);
    expect(metadata[DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS]).toEqual({
      scope: 'singleton',
      injects: ['config'],
    });
  });
});
