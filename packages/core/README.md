# @bunito/core

`@bunito/core` provides the runtime foundation of Bunito: application bootstrap,
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

await app.bootstrap();
```

`App.create()` compiles the root module, creates the container, resolves the logger
when available, runs setup entrypoints, and returns an application instance.

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

Module classes can also act as entrypoints and define lifecycle hooks such as
`@Setup()`, `@Bootstrap()`, and `@Destroy()`.

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
Optional injections are supported through `optional(...)` or injection descriptors.

### Configuration

`ConfigService` provides environment access helpers, while `registerConfig()` allows
you to create module-scoped config providers.

Example:

```ts
import { registerConfig } from '@bunito/core';

export const appConfig = registerConfig('app', () => ({
  port: 3000,
  env: process.env.NODE_ENV ?? 'development',
}));
```

### Logging

`LoggerModule` registers:

- `Logger`
- `LoggerConfig`

The built-in log formatters are:

- `prettify`
- `json`

`Logger` is a transient provider, which makes it easy to set per-context labels
for modules, services, and application wrappers.

## Minimal Example

```ts
import { App, Module, Provider } from '@bunito/core';

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
class AppModule {}

const app = await App.create('example', AppModule);
const helloService = await app.resolve(HelloService);

console.log(helloService.hello());
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

## Design Notes

- The container is the most sensitive part of the package. Small metadata or scope
  changes can affect every consumer package.
- `module` scope is intentionally distinct from `singleton`.
- The `module.extends` story is not finalized yet and should be treated as experimental.

## License

MIT
