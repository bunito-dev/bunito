import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '@bunito/core/container';
import { HTTP_CONTROLLER } from '../constants';
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
        HTTP_CONTROLLER,
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
