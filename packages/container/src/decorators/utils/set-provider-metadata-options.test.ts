import { describe, expect, it } from 'bun:test';
import { Module } from '../module';
import { Provider } from '../provider';

describe('setProviderMetadataOptions', () => {
  it('rejects duplicate and conflicting provider decorators', () => {
    expect(() => {
      @Provider()
      @Provider()
      class DuplicateProvider {}

      return DuplicateProvider;
    }).toThrow('@Provider() decorator can only be applied once');

    expect(() => {
      @Provider()
      @Module()
      class ConflictingProvider {}

      return ConflictingProvider;
    }).toThrow('@Provider() decorator conflicts with @Module() decorator');
  });
});
