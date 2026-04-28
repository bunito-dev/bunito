import { describe, expect, it } from 'bun:test';
import * as internals from './internals';

describe('internals', () => {
  it('re-exports internal APIs', () => {
    expect(internals.Container).toBeFunction();
    expect(internals.ContainerCompiler).toBeFunction();
    expect(internals.ContainerRuntime).toBeFunction();
    expect(internals.Id).toBeFunction();
    expect(internals.MODULE_ID).toBeDefined();
  });
});
