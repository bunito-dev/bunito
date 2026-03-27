import { describe, expect, it } from 'bun:test';
import { HTTP_CONTROLLER_METADATA_KEYS } from '../constants';
import { Patch } from './patch';

describe('Patch', () => {
  it('should create PATCH route metadata', () => {
    const metadata: DecoratorMetadataObject = {};

    Patch('/users/:id')(function handler() {}, {
      metadata,
      name: 'patch',
    } as ClassMethodDecoratorContext);

    expect(metadata[HTTP_CONTROLLER_METADATA_KEYS.methods]).toEqual([
      {
        path: '/users/:id',
        method: 'PATCH',
        name: 'patch',
      },
    ]);
  });
});
