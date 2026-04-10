# @bunito/core

`@bunito/core` is the runtime foundation of bunito.

## What This Package Is For

- application lifecycle through `App`
- dependency injection and provider resolution
- module compilation and runtime execution
- configuration helpers
- logger integration

This package is where the framework runtime lives. If you are composing modules,
registering providers, or booting an application, this is the package you use first.

## Installation

```bash
bun add @bunito/core
```

## Main Areas

- `App`
- container and module decorators
- provider scopes and lifecycle hooks
- `ConfigService` and config helpers
- `Logger` and `LoggerModule`

## Usage

```ts
import type { ModuleOptions } from '@bunito/core';
import { App, Logger, LoggerModule, Provider } from '@bunito/core';

@Provider()
class BarService {
  bar() {
    return ['bar'];
  }
}

@Provider({
  injects: [BarService],
})
class FooService {
  constructor(private readonly barService: BarService) {}

  foo() {
    return ['foo'];
  }

  bar() {
    return this.foo().concat(this.barService.bar());
  }
}

const AppModule: ModuleOptions = {
  imports: [LoggerModule],
  providers: [FooService, BarService],
};

const app = await App.create(AppModule);
const logger = await app.resolve(Logger);
const foo = await app.resolve(FooService);

logger.debug(foo.bar());

await app.boot();
await app.destroy();
```

This is the same general shape used in [`examples/core/001-basics`](../../examples/core/001-basics).

## Typical Exports

- `App`
- `Module`
- `Controller`
- `Provider`
- lifecycle decorators such as `OnInit()` and `OnBoot()`
- `Container`
- `ConfigModule`
- `ConfigService`
- `defineConfig`
- `Logger`
- `LoggerModule`

## License

MIT
