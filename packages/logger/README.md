# `@bunito/logger`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

Logger module for bunito applications.

It provides injectable loggers, request-aware trace helpers, configurable log
levels, and JSON or pretty output transports.

## Installation 📦

```bash
bun add @bunito/logger
```

## Usage ✨

```ts
import { Logger, LoggerModule } from '@bunito/logger';
import { Module, Provider } from '@bunito/container';

@Provider({
  injects: [Logger],
})
class Worker {
  constructor(private readonly logger: Logger) {}

  run(): void {
    this.logger.track().info('Worker started');
  }
}

@Module({
  imports: [LoggerModule],
  providers: [Worker],
})
class AppModule {}
```

Use `Logger.track()` when a log should include a fresh timestamp and duration
context while preserving the logger's existing context and prefix.

## Testing 🧪

Importing `@bunito/logger` registers logger test factories on the shared
`@bunito/testing` `Test` context:

- `Test.LoggerModule`: a `LoggerModule` replacement exporting `TestLogger`
  through the public `Logger` token.
- `Test.getLogger`: a helper that returns the `TestLogger` instance for a given
  context.

```ts
import { App, Logger, Provider } from '@bunito/bunito';
import { Test } from '@bunito/testing';

@Provider({
  injects: [Logger],
})
class Worker {
  constructor(private readonly logger: Logger) {}

  run(): void {
    this.logger.info('started');
  }
}

const app = await App.start({
  imports: [Test.LoggerModule],
  providers: [Worker],
});

const worker = await app.resolve(Worker);

worker.run();

expect(Test.getLogger(Worker).info).toBeCalledWith('started');
```

`TestLogger` methods are Bun mocks for `fatal`, `error`, `warn`, `info`, `ok`,
`verbose`, `debug`, `usePrefix`, `clone`, and `track`.

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Flogger
[npm-url]: https://www.npmjs.com/package/@bunito/logger
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
