import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '@bunito/core/container';
import { HTTP_CONTROLLER } from '../constants';
import { UsePath } from './use-path.decorator';

describe('UsePath', () => {
  it('stores additional controller path metadata', () => {
    class ExampleController {}

    const metadata = {} as DecoratorMetadata;

    UsePath('/nested')(ExampleController, { metadata } as never);

    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_OPTIONS] as Map<symbol, unknown[]>).get(
        HTTP_CONTROLLER,
      ),
    ).toEqual([{ kind: 'path', path: '/nested' }]);
  });
});
