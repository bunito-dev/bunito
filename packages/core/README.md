# @bunito/core

`@bunito/core` provides the runtime foundation of bunito: application lifecycle,
dependency injection, module compilation/runtime, configuration, and logging.

## What It Provides

- `App` for application creation and lifecycle
- dependency injection container with multiple scopes
- module system for imports, providers, controllers, and exports
- configuration support
- logger module with pluggable formatters

## Main Concepts

### App

`App` is the main runtime entrypoint.

```ts
import { App } from '@bunito/core';

const app = await App.create('my-app', rootModule);

await app.boot();
```

`App.create()` compiles the root module, creates the container, resolves the logger
when available, runs container setup, and returns an application instance.

### Modules

Applications are composed from modules.

Modules can be declared in two ways:

- as plain `ModuleOptions` objects
- as classes decorated with `@Module()`

Modules can define:

- `imports`
- `providers`
- `controllers`
- `exports`

Module classes are also providers and can define lifecycle hooks such as:

- `@OnInit()`
- `@OnResolve()`
- `@OnBoot()`
- `@OnDestroy()`

The same lifecycle decorators can be used on other class providers.

### Providers And Resolution

Providers can be registered as:

- classes
- factories
- values

Supported scopes:

- `singleton`
- `module`
- `request`
- `transient`

Providers can be resolved by class, factory token, string token, or symbol token.
Optional injections are supported through `optional(...)`.

The main decorators exported by the package are:

- `@Module()`
- `@Controller()`
- `@Provider()`

### Configuration

`ConfigService` provides environment access helpers, while `defineConfig()` allows
you to create module-scoped config providers.

Example:

```ts
import { defineConfig } from '@bunito/core';

export const AppConfig = defineConfig('app', () => ({
  port: 3000,
  env: process.env.NODE_ENV ?? 'development',
}));
```

`ConfigModule` registers and exports `ConfigService`.

### Logging

`LoggerModule` registers:

- `Logger`
- `LoggerConfig`

The built-in log formatters are:

- `prettify`
- `json`
- `none`

`Logger` is a transient provider, which makes it easy to set per-context labels
for modules, services, and application wrappers.

Supported log levels are:

- `fatal`
- `error`
- `warn`
- `info`
- `ok`
- `trace`
- `debug`
- `verbose`

## Minimal Example

```ts
import { App, Module, OnInit, Provider } from '@bunito/core';

@Provider()
class HelloService {
  hello() {
    return 'hello';
  }
}

@Module({
  providers: [HelloService],
  exports: [HelloService],
})
class AppModule {
  @OnInit()
  ready() {
    console.log('module initialized');
  }
}

const app = await App.create('example', AppModule);
const helloService = await app.resolve(HelloService);

console.log(helloService.hello());
await app.boot();
await app.destroy();
```

## Package Structure

- `src/app`: `App` wrapper and integration entrypoint
- `src/container`: DI container, compiler/runtime, decorators, and helpers
- `src/config`: config service and config registration helpers
- `src/logger`: logger module, config, parsers, and formatters

## Installation

```bash
bun add @bunito/core
```

## Main Exports

Top-level exports include:

- `App`
- `Container`
- `Module`
- `Controller`
- `Provider`
- `OnInit`
- `OnResolve`
- `OnBoot`
- `OnDestroy`
- `optional`
- `ConfigModule`
- `ConfigService`
- `defineConfig`
- `Logger`
- `LoggerModule`
- logger constants and logger types

## Design Notes

- The container is the most sensitive part of the package. Small metadata or scope
  changes can affect every consumer package.
- `module` scope is intentionally distinct from `singleton`.
- This package depends only on `@bunito/common`.
- Decorator metadata is stored through standard `Symbol.metadata` helpers from
  `@bunito/common`.

## License

MIT
