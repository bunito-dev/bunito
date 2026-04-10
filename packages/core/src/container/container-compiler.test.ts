import { describe, expect, it } from 'bun:test';
import { ContainerCompiler } from './container-compiler';
import { Controller, Module, OnBoot, Provider } from './decorators';
import { Id } from './id';
import type { ModuleOptions } from './types';

describe('ContainerCompiler', () => {
  it('should compile modules and normalize providers, controllers, exports and lifecycle metadata', () => {
    @Controller({
      injects: ['dep'],
    })
    class ControllerClass {}

    @Provider({
      injects: ['dep', { token: 'optional-dep', optional: true }],
    })
    class ClassProvider {}

    @Provider()
    class BootProvider {
      @OnBoot()
      onBoot(): void {}
    }

    @Module({
      providers: [
        ClassProvider,
        BootProvider,
        () => 'factory-result',
        { token: 'value-token', useValue: 123 },
        null,
      ],
      controllers: [ControllerClass, null],
      exports: [ClassProvider, BootProvider, 'value-token', null],
    })
    class EntryModule {}

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule(EntryModule);
    const compiled = compiler.getModule(moduleId);

    expect(compiled.useClass).toBe(EntryModule);
    expect(compiled.controllers.has(Id.for(ControllerClass))).toBeTrue();
    expect(compiled.providers.get(Id.for(EntryModule))).toEqual({
      kind: 'class',
      scope: 'singleton',
      useClass: EntryModule,
      injects: [],
      lifecycle: new Map(),
    });
    expect(compiled.providers.get(Id.for(ControllerClass))).toEqual({
      kind: 'class',
      scope: 'request',
      useClass: ControllerClass,
      injects: [{ providerId: Id.for('dep'), optional: false }],
      lifecycle: new Map(),
    });
    expect(compiled.providers.get(Id.for(ClassProvider))).toEqual({
      kind: 'class',
      scope: 'singleton',
      useClass: ClassProvider,
      injects: [
        { providerId: Id.for('dep'), optional: false },
        { providerId: Id.for('optional-dep'), optional: true },
      ],
      lifecycle: new Map(),
    });
    expect(compiled.providers.get(Id.for(BootProvider))).toEqual({
      kind: 'class',
      scope: 'singleton',
      useClass: BootProvider,
      injects: [],
      lifecycle: new Map([['onBoot', 'onBoot']]),
    });
    expect(compiled.providers.get(Id.for('value-token'))).toEqual({
      kind: 'value',
      useValue: 123,
    });
    expect(compiled.exports.get(Id.for(ClassProvider))).toBe(moduleId);
    expect(compiled.exports.get(Id.for(BootProvider))).toBe(moduleId);
    expect(compiled.exports.get(Id.for('value-token'))).toBe(moduleId);
  });

  it('should compile module-class providers with custom scope and factory provider options', () => {
    const factoryProvider = {
      token: 'factory-token',
      scope: 'request' as const,
      injects: ['dep', { token: 'optional-dep', optional: true }, null],
      useFactory: () => 'factory-value',
    };

    @Module({
      scope: 'module',
      injects: ['module-dep', null],
      providers: [factoryProvider],
      exports: ['factory-token'],
    })
    class FeatureModule {}

    const compiler = new ContainerCompiler();
    const moduleId = compiler.compileModule(FeatureModule);
    const compiled = compiler.getModule(moduleId);

    expect(compiled.providers.get(Id.for(FeatureModule))).toEqual({
      kind: 'class',
      scope: 'module',
      useClass: FeatureModule,
      injects: [{ providerId: Id.for('module-dep'), optional: false }],
      lifecycle: new Map(),
    });
    expect(compiled.providers.get(Id.for('factory-token'))).toEqual({
      kind: 'factory',
      scope: 'request',
      useFactory: factoryProvider.useFactory,
      injects: [
        { providerId: Id.for('dep'), optional: false },
        { providerId: Id.for('optional-dep'), optional: true },
      ],
    });
    expect(compiled.exports.get(Id.for('factory-token'))).toBe(moduleId);
  });

  it('should locate providers from the current module and imported exports', () => {
    @Provider()
    class LocalProvider {}

    @Provider()
    class ExportedProvider {}

    const importedModule = {
      providers: [ExportedProvider],
      exports: [ExportedProvider],
    };
    const rootModule = {
      providers: [LocalProvider],
      imports: [importedModule],
    };

    const compiler = new ContainerCompiler();
    const rootModuleId = compiler.compileModule(rootModule);

    expect(compiler.locateProvider(Id.for(LocalProvider), rootModuleId)).toEqual({
      moduleId: rootModuleId,
      provider: {
        kind: 'class',
        scope: 'singleton',
        useClass: LocalProvider,
        injects: [],
        lifecycle: new Map(),
      },
    });
    expect(compiler.locateProvider(Id.for(ExportedProvider), rootModuleId)).toEqual({
      moduleId: Id.for(importedModule),
      provider: {
        kind: 'class',
        scope: 'singleton',
        useClass: ExportedProvider,
        injects: [],
        lifecycle: new Map(),
      },
    });
    expect(compiler.locateProvider(Id.for('missing'), rootModuleId)).toBeUndefined();
    expect(
      compiler.locateProvider(Id.for('missing'), new Id('unknown-module')),
    ).toBeUndefined();
  });

  it('should throw when exporting a provider that is missing from the module graph', () => {
    const compiler = new ContainerCompiler();

    expect(() =>
      compiler.compileModule({
        exports: ['missing-token'],
      }),
    ).toThrow('not found');
  });

  it('should reuse an already compiled module id when compiling the same module twice', () => {
    const module = {
      providers: [{ token: 'value-token', useValue: 123 }],
    };
    const compiler = new ContainerCompiler();

    const first = compiler.compileModule(module);
    const second = compiler.compileModule(module);

    expect(second).toBe(first);
  });

  it('should throw when reading a missing compiled module', () => {
    const compiler = new ContainerCompiler();

    expect(() => compiler.getModule(new Id('missing'))).toThrow('not found');
  });

  it('should throw when a class module is missing metadata', () => {
    class MissingModuleMetadata {}

    const compiler = new ContainerCompiler();

    expect(() => compiler.compileModule(MissingModuleMetadata)).toThrow(
      'Missing module metadata',
    );
  });

  it('should throw when a controller is missing controller metadata', () => {
    @Provider()
    class UndecoratedController {}

    const compiler = new ContainerCompiler();

    expect(() =>
      compiler.compileModule({
        controllers: [UndecoratedController],
      }),
    ).toThrow('Missing controller metadata');
  });

  it('should throw when a provider is missing provider metadata', () => {
    class UndecoratedProvider {}

    const compiler = new ContainerCompiler();

    expect(() =>
      compiler.compileModule({
        providers: [UndecoratedProvider],
      }),
    ).toThrow('Missing provider metadata');
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
    ).toThrow('exported by multiple modules');
  });

  it('should detect circular dependencies between modules', () => {
    const moduleA: ModuleOptions = {};
    const moduleB: ModuleOptions = {
      imports: [moduleA],
    };

    moduleA.imports = [moduleB];

    const compiler = new ContainerCompiler();

    expect(() => compiler.compileModule(moduleA)).toThrow('Circular dependency detected');
  });
});
