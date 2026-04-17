import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '@bunito/container';
import { CONTROLLER_COMPONENT } from './constants';
import { OnException } from './on-exception.decorator';

describe('OnException', () => {
  it('stores exception handler metadata with default method matching', () => {
    const metadata = {} as DecoratorMetadata;

    OnException()(() => new Response(), {
      metadata,
      name: 'handleException',
    } as never);

    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_METHODS] as Map<symbol, unknown[]>).get(
        CONTROLLER_COMPONENT,
      ),
    ).toEqual([
      {
        propKey: 'handleException',
        options: {
          kind: 'onException',
          method: 'ALL',
        },
      },
    ]);
  });
});
