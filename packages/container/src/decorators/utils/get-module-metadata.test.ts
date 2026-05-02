import { describe, expect, it } from 'bun:test';
import { Module } from '../module.decorator';
import { getModuleMetadata } from './get-module-metadata';

describe('getModuleMetadata', () => {
  it('reads module metadata from classes and returns undefined otherwise', () => {
    @Module({
      providers: [],
    })
    class ExampleModule {}

    class PlainClass {}

    expect(getModuleMetadata(ExampleModule)).toEqual({
      providers: [],
    });
    expect(getModuleMetadata(PlainClass)).toBeUndefined();
  });
});
