import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '@bunito/container';
import { CONTROLLER_COMPONENT } from './constants';
import { OnResponse } from './on-response.decorator';

describe('OnResponse', () => {
  it('stores response handler metadata with default method matching', () => {
    const metadata = {} as DecoratorMetadata;

    OnResponse()(() => new Response(), {
      metadata,
      name: 'respond',
    } as never);

    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_METHODS] as Map<symbol, unknown[]>).get(
        CONTROLLER_COMPONENT,
      ),
    ).toEqual([
      {
        propKey: 'respond',
        options: {
          kind: 'onResponse',
          method: 'ALL',
        },
      },
    ]);
  });
});
