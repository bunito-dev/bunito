# `@bunito/bunito`

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
