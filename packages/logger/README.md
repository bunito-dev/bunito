# `@bunito/logger`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

Logger module for bunito applications.

It provides injectable logging, trace helpers, and JSON/pretty output extensions.

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
    this.logger.setContext(Worker).info('Worker started');
  }
}

@Module({
  imports: [LoggerModule],
  providers: [Worker],
})
class AppModule {}
```

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Flogger
[npm-url]: https://www.npmjs.com/package/@bunito/logger
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
