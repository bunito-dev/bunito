import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '@bunito/core/container';
import { HTTP_CONTROLLER } from '../constants';
import { Controller } from './controller.decorator';

describe('Controller', () => {
  it('stores the controller key, path metadata and request scope by default', () => {
    class ExampleController {}

    const metadata = {} as DecoratorMetadata;

    Controller('/users')(ExampleController, { metadata } as never);

    expect(metadata[DECORATOR_METADATA_KEYS.COMPONENT_KEYS]).toEqual(
      new Set([HTTP_CONTROLLER]),
    );
    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_OPTIONS] as Map<symbol, unknown[]>).get(
        HTTP_CONTROLLER,
      ),
    ).toEqual([{ kind: 'path', path: '/users' }]);
    expect(metadata[DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS]).toEqual({
      scope: 'request',
    });
  });

  it('merges provider options when only options are passed', () => {
    class ExampleController {}

    const metadata = {} as DecoratorMetadata;

    Controller({ scope: 'singleton' })(ExampleController, {
      metadata,
    } as never);

    expect(metadata[DECORATOR_METADATA_KEYS.COMPONENT_OPTIONS]).toBeUndefined();
    expect(metadata[DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS]).toEqual({
      scope: 'singleton',
    });
  });
});
