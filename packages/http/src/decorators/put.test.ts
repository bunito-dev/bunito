import { describe, expect, it } from 'bun:test';
import { HTTP_CONTROLLER_METADATA_KEYS } from '../constants';
import { Put } from './put';

describe('Put', () => {
  it('should create PUT route metadata', () => {
    const metadata: DecoratorMetadataObject = {};

    Put('/users/:id')(function handler() {}, {
      metadata,
      name: 'update',
    } as ClassMethodDecoratorContext);

    expect(metadata[HTTP_CONTROLLER_METADATA_KEYS.methods]).toEqual([
      {
        path: '/users/:id',
        method: 'PUT',
        name: 'update',
      },
    ]);
  });
});
