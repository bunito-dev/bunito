# `@bunito/logger`

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
