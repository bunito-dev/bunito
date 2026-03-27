import { describe, expect, it } from 'bun:test';
import { HTTP_CONTROLLER_METADATA_KEYS } from '../constants';
import { Head } from './head';

describe('Head', () => {
  it('should create HEAD route metadata', () => {
    const metadata: DecoratorMetadataObject = {};

    Head('/users')(function handler() {}, {
      metadata,
      name: 'head',
    } as ClassMethodDecoratorContext);

    expect(metadata[HTTP_CONTROLLER_METADATA_KEYS.methods]).toEqual([
      {
        path: '/users',
        method: 'HEAD',
        name: 'head',
      },
    ]);
  });
});
