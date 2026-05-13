# Microservices

The `examples/microservices` workspace shows three apps:

- `foo`: exposes an HTTP route and handles `foo.process` messages.
- `bar`: exposes an HTTP route and handles `bar.process` messages.
- `mono`: imports both modules into one process.

## Run

From `examples/microservices`:

```bash
bun run start foo
bun run start bar
```

In another terminal, call either HTTP endpoint. The `.env` files in each app
choose the ports and broker settings.

Run the composed app in one process:

```bash
bun run start mono
```

## Controller

The controllers combine HTTP and broker decorators:

```ts
import { BrokerService, Data, OnMessage } from '@bunito/broker';
import { Controller, Logger } from '@bunito/bunito';
import { Get, Query } from '@bunito/http';

@Controller('foo', {
  injects: [Logger, BrokerService],
})
class FooController {
  constructor(
    private readonly logger: Logger,
    private readonly broker: BrokerService,
  ) {}

  @Get('/', {
    injects: [Query],
  })
  sendMessage(query: Query<{ message?: string }>): Promise<string> {
    return this.broker.sendRequest('bar.process', query.message ?? 'Hello');
  }

  @OnMessage('process', {
    injects: [Data],
  })
  processMessage(data: string): string {
    this.logger.debug('processMessage() called', { data });

    return `${data} ... I'm foo!`;
  }
}
```

## Modules

Each app imports the broker, local adapter, logger, and HTTP modules:

```ts
import { BrokerModule, LocalBrokerModule } from '@bunito/broker';
import { LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule, JSONSerializer, UseMiddleware } from '@bunito/http';

@Module({
  imports: [BrokerModule, LocalBrokerModule, LoggerModule, HTTPModule],
  controllers: [FooController],
})
@UseMiddleware(JSONSerializer)
class FooModule {}
```

`NatsBrokerModule` can be added when the same handlers should run through NATS.
