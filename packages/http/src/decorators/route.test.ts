import { describe, expect, it } from 'bun:test';
import { HTTP_CONTROLLER_METADATA_KEYS } from '../constants';
import { Route } from './route';

describe('Route', () => {
  it('should store route path metadata on the decorated class', () => {
    class TestController {}

    const metadata: DecoratorMetadataObject = {};

    Route('/users')(TestController, {
      metadata,
    } as ClassDecoratorContext);

    expect(metadata[HTTP_CONTROLLER_METADATA_KEYS.path]).toBe('/users');
  });
});
