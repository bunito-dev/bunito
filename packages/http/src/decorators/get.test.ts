import { describe, expect, it } from 'bun:test';
import { HTTP_CONTROLLER_METADATA_KEYS } from '../constants';
import { Get } from './get';

describe('Get', () => {
  it('should create GET route metadata', () => {
    const metadata: DecoratorMetadataObject = {};

    Get('/users')(function handler() {}, {
      metadata,
      name: 'list',
    } as ClassMethodDecoratorContext);

    expect(metadata[HTTP_CONTROLLER_METADATA_KEYS.methods]).toEqual([
      {
        path: '/users',
        method: 'GET',
        name: 'list',
      },
    ]);
  });
});
