import { describe, expect, it } from 'bun:test';
import {
  Component,
  Container,
  ContainerRuntime,
  Id,
  Module,
  Provider,
  resolveToken,
} from './internals';

describe('container internals', () => {
  it('re-exports internal container building blocks', () => {
    expect(Component).toBeFunction();
    expect(Container).toBeFunction();
    expect(ContainerRuntime).toBeFunction();
    expect(Id).toBeFunction();
    expect(Module).toBeFunction();
    expect(Provider).toBeFunction();
    expect(resolveToken).toBeFunction();
  });
});
