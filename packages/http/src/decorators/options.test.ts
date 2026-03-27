import { describe, expect, it } from 'bun:test';
import { HTTP_CONTROLLER_METADATA_KEYS } from '../constants';
import { Options } from './options';

describe('Options', () => {
  it('should create OPTIONS route metadata', () => {
    const metadata: DecoratorMetadataObject = {};

    Options('/users')(function handler() {}, {
      metadata,
      name: 'options',
    } as ClassMethodDecoratorContext);

    expect(metadata[HTTP_CONTROLLER_METADATA_KEYS.methods]).toEqual([
      {
        path: '/users',
        method: 'OPTIONS',
        name: 'options',
      },
    ]);
  });
});
