import { describe, expect, it } from 'bun:test';
import {
  CLASS_METADATA_KEYS,
  Controller,
  Module,
  Provider,
  UsePrefix,
} from '../decorators';
import { Id } from '../utils';
import { ContainerCompiler } from './container-compiler';

describe('ContainerCompiler', () => {
  it('compiles modules, providers, controllers, and exports', () => {
    @Provider()
    class ExportedProvider {}

    @Controller('/items')
    @UsePrefix('/v1')
    class ItemsController {}

    @Module({
      providers: [ExportedProvider],
      exports: [ExportedProvider],
    })
    class ChildModule {}

    @Module({
      imports: [ChildModule],
      providers: [ItemsController],
    })
    class RootModule {}

    const compiler = new ContainerCompiler(RootModule);
    const root = compiler.getModule(Id.for(RootModule));

    expect(root.children).toEqual(new Set([Id.for(ChildModule)]));
    expect(root.providers?.has(Id.for(ExportedProvider))).toBeTrue();
    expect(root.controllers?.[0]?.providerId).toBe(Id.for(ItemsController));
    expect(compiler.getProvider(Id.for(ExportedProvider)).moduleId).toBe(
      Id.for(ChildModule),
    );
  });

  it('rejects missing module metadata and circular imports', () => {
    expect(() => new ContainerCompiler(class MissingModule {})).toThrow(
      'Missing @Module() metadata',
    );

    @Module({
      imports: [],
    })
    class A {}

    @Module({
      imports: [A],
    })
    class B {}

    A[Symbol.metadata] ??= {};
    const metadata = A[Symbol.metadata];
    if (!metadata) {
      throw new Error('Expected metadata object');
    }
    // This avoids using a forward class reference before B is initialized.
    metadata[CLASS_METADATA_KEYS.module] = {
      imports: [B],
    };

    expect(() => new ContainerCompiler(A)).toThrow('Circular module dependency');
  });
});
