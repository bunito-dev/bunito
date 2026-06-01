# Microservices

The `examples/microservices` workspace shows two workspace apps and one composed
root app:

- `foo`: exposes an HTTP route and handles `foo.process` messages.
- `bar`: exposes an HTTP route and handles `bar.process` messages.
- `src/main.ts`: imports both modules into one process.

## Run

From `examples/microservices`:

```bash
bun run start foo
bun run start bar
```

In another terminal, call either HTTP endpoint. The `.env` files in each app
choose the ports and broker settings.

Run the composed root app in one process:

```bash
bun run start --root
```

Start every discovered app with:

```bash
bun run start
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
  async sendMessage(query: Query<{ message?: string }>): Promise<Response> {
    const message = query.message ?? 'Hello';
    const payload = await this.broker.sendRequest('bar.process', message);

    return Response.json({
      message,
      reply: payload?.decode(),
    });
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

## Test The Composition

The composed root app can be tested without starting real servers or broker
transports. The example test imports `Test.BunServerModule`,
`Test.ConfigModule`, `Test.LoggerModule`, and `Test.BrokerModule`, then resolves
`BrokerService` against the composed module:

```ts
import { BrokerService, Payload } from '@bunito/broker';
import { App } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { Test } from '@bunito/testing';

const app = await App.start({
  imports: [
    Test.BunServerModule,
    Test.ConfigModule,
    Test.LoggerModule,
    HTTPModule,
    Test.BrokerModule,
    ComposedModule,
  ],
});

const broker = await app.resolve(BrokerService);
const payload = await broker.sendRequest('foo.process', 'Hello!');

expect(payload?.decode()).toBe("Hello! ... I'm foo!");
expect(Test.broker.sendRequest).toBeCalledWith('foo.process', expect.any(Payload));

await app.shutdown();
```

This mirrors `examples/microservices/test/composed.spec.ts`.
