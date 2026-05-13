import { describe, expect, it } from 'bun:test';
import { Module } from '../module';
import { getClassMetadata } from './get-class-metadata';

describe('getClassMetadata', () => {
  it('reads metadata from classes and class instances', () => {
    @Module({
      providers: [],
    })
    class ExampleModule {}

    expect(getClassMetadata(ExampleModule, 'module')).toEqual({
      providers: [],
    });
    expect(getClassMetadata(new ExampleModule(), 'module')).toEqual({
      providers: [],
    });
    expect(getClassMetadata(null, 'module')).toBeUndefined();
  });
});
