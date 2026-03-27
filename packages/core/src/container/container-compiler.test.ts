import { describe, expect, it } from 'bun:test';
import { MODULE_METADATA_KEY, PROVIDER_METADATA_KEY } from './constants';
import { ContainerCompiler } from './container-compiler';
import { Id } from './id';
import type { ModuleOptions } from './types';

type ClassLike = abstract new (...args: never) => unknown;

function defineMetadata(target: object, metadata: DecoratorMetadataObject): void {
  Object.defineProperty(target, Symbol.metadata, {
    value: metadata,
    configurable: true,
  });
}

function defineProvider(
  target: ClassLike,
  options: Record<PropertyKey, unknown> = {},
): void {
  defineMetadata(target, {
    [PROVIDER_METADATA_KEY]: {
      useClass: target,
      ...options,
    },
  });
}

function defineModule(target: ClassLike, options: ModuleOptions = {}): void {
  defineMetadata(target, {
    [MODULE_METADATA_KEY]: options,
    [PROVIDER_METADATA_KEY]: {
      useClass: target,
      scope: 'module',
      injects: [],
    },
  });
}

describe('ContainerCompiler', () => {
  it('should compile modules and normalize providers, controllers and exports', () => {
    class EntryModule {}
    class ControllerClass {}
    class ClassProvider {}

    defineModule(EntryModule, {
      providers: [
        ClassProvider,
        () => 'factory-result',
        { token: 'value-token', useValue: 123 },
        null,
      ],
      controllers: [ControllerClass, undefined],
      exports: [ClassProvider, 'value-token', null],
    });
    defineProvider(ControllerClass, {
      scope: 'request',
      injects: ['dep'],
    });
    defineProvider(ClassProvider, {
      injects: ['dep', { token: 'optional-dep', optional: true }],
    });

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule(EntryModule);
    const compiled = compiler.getModule(moduleId);

    expect(compiled.entrypointId).toBe(Id.for(EntryModule));
    expect(compiled.controllers.has(Id.for(ControllerClass))).toBeTrue();
    expect(compiled.providers.get(Id.for(EntryModule))).toEqual({
      kind: 'class',
      scope: 'module',
      useClass: EntryModule,
      injects: [],
    });
    expect(compiled.providers.get(Id.for(ControllerClass))).toEqual({
      kind: 'class',
      scope: 'request',
      useClass: ControllerClass,
      injects: [{ providerId: Id.for('dep'), optional: false }],
    });
    expect(compiled.providers.get(Id.for(ClassProvider))).toEqual({
      kind: 'class',
      scope: 'singleton',
      useClass: ClassProvider,
      injects: [
        { providerId: Id.for('dep'), optional: false },
        { providerId: Id.for('optional-dep'), optional: true },
      ],
    });
    expect(compiled.providers.get(Id.for('value-token'))).toEqual({
      kind: 'value',
      useValue: 123,
    });
    expect(compiled.exports.get(Id.for(ClassProvider))).toBe(moduleId);
    expect(compiled.exports.get(Id.for('value-token'))).toBe(moduleId);
  });

  it('should locate providers from the current module and imported exports', () => {
    class ExportedProvider {}

    defineProvider(ExportedProvider);

    const importedModule = {
      providers: [ExportedProvider],
      exports: [ExportedProvider],
    };
    const rootModule = {
      imports: [importedModule],
    };

    const compiler = new ContainerCompiler();
    const rootModuleId = compiler.compileModule(rootModule);

    expect(compiler.tryLocateProvider(Id.for(ExportedProvider), rootModuleId)).toEqual({
      moduleId: Id.for(importedModule),
      provider: {
        kind: 'class',
        scope: 'singleton',
        useClass: ExportedProvider,
        injects: [],
      },
    });
    expect(compiler.tryLocateProvider(Id.for('missing'), rootModuleId)).toBeUndefined();
  });

  it('should throw when reading a missing compiled module', () => {
    const compiler = new ContainerCompiler();

    expect(() => compiler.getModule(Id.unique('missing'))).toThrow('not found');
  });

  it('should throw when a class module is missing metadata', () => {
    class MissingModuleMetadata {}

    const compiler = new ContainerCompiler();

    expect(() => compiler.compileModule(MissingModuleMetadata)).toThrow(
      `Missing module ${Id.for(MissingModuleMetadata)} metadata`,
    );
  });

  it('should throw when a controller is missing provider metadata', () => {
    class UndecoratedController {}

    const compiler = new ContainerCompiler();

    expect(() =>
      compiler.compileModule({
        controllers: [UndecoratedController],
      }),
    ).toThrow(`controller ${UndecoratedController.name} metadata`);
  });

  it('should throw when a provider is missing metadata', () => {
    class UndecoratedProvider {}

    const compiler = new ContainerCompiler();

    expect(() =>
      compiler.compileModule({
        providers: [UndecoratedProvider],
      }),
    ).toThrow(`provider ${UndecoratedProvider.name} metadata`);
  });

  it('should throw when the same export is re-exported by multiple imported modules', () => {
    const token = 'shared-token';

    const moduleA = {
      providers: [{ token, useValue: 'a' }],
      exports: [token],
    };
    const moduleB = {
      providers: [{ token, useValue: 'b' }],
      exports: [token],
    };

    const compiler = new ContainerCompiler();

    expect(() =>
      compiler.compileModule({
        imports: [moduleA, moduleB],
        exports: [token],
      }),
    ).toThrow(`Provider ${Id.for(token)} is exported by multiple modules`);
  });

  it('should detect circular dependencies between modules', () => {
    const moduleA: ModuleOptions = {};
    const moduleB: ModuleOptions = {
      imports: [moduleA],
    };

    moduleA.imports = [moduleB];

    const compiler = new ContainerCompiler();

    expect(() => compiler.compileModule(moduleA)).toThrow(
      'Circular dependency detected between modules',
    );
  });

  it('should normalize provider options through internal helpers', () => {
    class ClassProvider {}
    class ClassModule {}
    const factory = () => 'factory-result';

    defineProvider(ClassProvider, {
      token: 'class-token',
      scope: 'request',
      injects: ['dep'],
    });
    defineModule(ClassModule, {
      imports: [{}],
      providers: [ClassProvider],
      controllers: [],
      exports: ['class-token'],
    });

    const compiler = new ContainerCompiler() as unknown as {
      tryResolveModuleOptions: (moduleRef: unknown) => unknown;
      tryResolveProviderOptions: (providerRef: unknown) => unknown;
      resolveProviderInjection: (options: unknown) => unknown;
      resolveProviderToken: (token: unknown) => unknown;
    };

    expect(compiler.tryResolveModuleOptions(ClassModule)).toEqual({
      entrypointRef: ClassModule,
      extends: undefined,
      imports: [{}],
      providers: [ClassProvider],
      controllers: [],
      exports: ['class-token'],
    });
    expect(
      compiler.tryResolveModuleOptions({
        imports: [null, {}],
        providers: [undefined, ClassProvider],
        controllers: [null],
        exports: [undefined, 'class-token'],
      }),
    ).toEqual({
      entrypointRef: undefined,
      extends: undefined,
      imports: [{}],
      providers: [ClassProvider],
      controllers: [],
      exports: ['class-token'],
    });
    expect(compiler.tryResolveProviderOptions(ClassProvider)).toEqual({
      token: 'class-token',
      kind: 'class',
      scope: 'request',
      useClass: ClassProvider,
      injects: [{ providerId: Id.for('dep'), optional: false }],
    });
    expect(compiler.tryResolveProviderOptions(factory)).toEqual({
      token: factory,
      kind: 'factory',
      scope: 'singleton',
      useFactory: factory,
      injects: [],
    });
    expect(
      compiler.tryResolveProviderOptions({
        token: 'value-token',
        useValue: 123,
      }),
    ).toEqual({
      token: 'value-token',
      kind: 'value',
      useValue: 123,
    });
    expect(compiler.resolveProviderInjection('dep')).toEqual({
      providerId: Id.for('dep'),
      optional: false,
    });
    expect(
      compiler.resolveProviderInjection({
        token: 'optional-dep',
        optional: true,
      }),
    ).toEqual({
      providerId: Id.for('optional-dep'),
      optional: true,
    });
    expect(
      compiler.resolveProviderToken({
        token: Symbol.for('token-object'),
      }),
    ).toBe(Id.for(Symbol.for('token-object')));
    expect(
      compiler.resolveProviderToken({
        useClass: ClassProvider,
      }),
    ).toBe(Id.for(ClassProvider));
    expect(
      compiler.resolveProviderToken({
        useFactory: factory,
      }),
    ).toBe(Id.for(factory));
  });
});
