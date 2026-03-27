import { describe, expect, it } from 'bun:test';
import { HTTP_CONTROLLER_METADATA_KEYS } from '../constants';
import { Post } from './post';

describe('Post', () => {
  it('should create POST route metadata', () => {
    const metadata: DecoratorMetadataObject = {};

    Post('/users')(function handler() {}, {
      metadata,
      name: 'create',
    } as ClassMethodDecoratorContext);

    expect(metadata[HTTP_CONTROLLER_METADATA_KEYS.methods]).toEqual([
      {
        path: '/users',
        method: 'POST',
        name: 'create',
      },
    ]);
  });
});
