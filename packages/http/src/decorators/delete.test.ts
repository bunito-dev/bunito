import { describe, expect, it } from 'bun:test';
import { HTTP_CONTROLLER_METADATA_KEYS } from '../constants';
import { Delete } from './delete';

describe('Delete', () => {
  it('should create DELETE route metadata', () => {
    const metadata: DecoratorMetadataObject = {};

    Delete('/users/:id')(function handler() {}, {
      metadata,
      name: 'remove',
    } as ClassMethodDecoratorContext);

    expect(metadata[HTTP_CONTROLLER_METADATA_KEYS.methods]).toEqual([
      {
        path: '/users/:id',
        method: 'DELETE',
        name: 'remove',
      },
    ]);
  });
});
