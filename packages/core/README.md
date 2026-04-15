# @bunito/core

Core runtime package for bunito.

`@bunito/core` provides the app lifecycle, dependency injection container, modules, config helpers, logger integration, and server primitives used by higher-level packages.

## Installation

```bash
bun add @bunito/core
```

## What It Is For

Use `@bunito/core` when you want to:

- compose applications from modules and providers
- resolve dependencies through the container
- use lifecycle hooks such as boot and shutdown
- build scripts, services, or infrastructure modules without HTTP

## Usage

```ts
import { App, Logger, LoggerModule, Provider } from '@bunito/core';

@Provider()
class GreetingService {
  hello() {
    return 'Hello from bunito';
  }
}

const app = await App.create({
  imports: [LoggerModule],
  providers: [GreetingService],
});

const logger = await app.resolve(Logger);
const greeting = await app.resolve(GreetingService);

logger.info(greeting.hello());

await app.start();
await app.shutdown();
```

See the runnable example in [`examples/core/001-basics`](../../examples/core/001-basics).

## License

MIT
