import { describe, expect, it } from 'bun:test';
import { HTTP_CONTROLLER_METADATA_KEYS } from '../../constants';
import { createMethodDecorator } from './create-method-decorator';

function createMethodContext(
  metadata: DecoratorMetadataObject,
  name: PropertyKey,
): ClassMethodDecoratorContext {
  return {
    metadata,
    name,
  } as ClassMethodDecoratorContext;
}

describe('createMethodDecorator', () => {
  it('should create method metadata from a string path', () => {
    const metadata: DecoratorMetadataObject = {};
    const decorator = createMethodDecorator('GET');

    decorator('/users')(function handler() {}, createMethodContext(metadata, 'list'));

    expect(metadata[HTTP_CONTROLLER_METADATA_KEYS.methods]).toEqual([
      {
        path: '/users',
        method: 'GET',
        name: 'list',
      },
    ]);
  });

  it('should create method metadata from an options object and defaults', () => {
    const metadata: DecoratorMetadataObject = {};
    const decorator = createMethodDecorator('POST');

    decorator({
      path: '/users',
    })(function handler() {}, createMethodContext(metadata, 'create'));
    decorator()(function handler() {}, createMethodContext(metadata, 'fallback'));

    expect(metadata[HTTP_CONTROLLER_METADATA_KEYS.methods]).toEqual([
      {
        path: '/users',
        method: 'POST',
        name: 'create',
      },
      {
        path: '/',
        method: 'POST',
        name: 'fallback',
      },
    ]);
  });
});
