# `@bunito/bunito`

[![NPM Version][npm-img]][npm-url]
![License MIT][license-img]

Main application entrypoint for bunito.

Use this package for the core application APIs: `App`, modules, providers,
configuration, and logging.

## Installation 📦

```bash
bun add @bunito/bunito
```

## Usage ✨

```ts
import { App, Logger, LoggerModule, Module, Provider } from '@bunito/bunito';

@Provider({
  injects: [Logger],
})
class HelloService {
  constructor(private readonly logger: Logger) {}

  sayHello(): void {
    this.logger.info('Hello from bunito');
  }
}

@Module({
  imports: [LoggerModule],
  providers: [HelloService],
})
class AppModule {}

const app = await App.start(AppModule);
const hello = await app.resolve(HelloService);

hello.sayHello();
await app.shutdown();
```

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fbunito
[npm-url]: https://www.npmjs.com/package/@bunito/bunito
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
