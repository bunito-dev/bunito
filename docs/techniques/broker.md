# Broker

Broker support lives in `@bunito/broker`. Use it when apps need message handlers,
request/reply communication, or event-style messages.

## Enable Broker

Import `BrokerModule` and one adapter module:

```ts
import { BrokerModule, LocalBrokerModule } from '@bunito/broker';
import { LoggerModule, Module } from '@bunito/bunito';

@Module({
  imports: [LoggerModule, BrokerModule, LocalBrokerModule],
})
class AppModule {}
```

`LocalBrokerModule` is useful for examples and local development. `NatsBrokerModule`
uses NATS through the optional `@nats-io/transport-node` dependency.

## Message Handlers

Broker handlers are controller methods:

```ts
import { Data, OnMessage } from '@bunito/broker';
import { Controller, Logger } from '@bunito/bunito';

@Controller('orders', {
  injects: [Logger],
})
class OrdersController {
  constructor(private readonly logger: Logger) {}

  @OnMessage('created', {
    injects: [Data],
  })
  handleCreated(data: Data<{ id: string }>): string {
    this.logger.debug('order created', data);

    return `processed:${data.id}`;
  }
}
```

The controller prefix and handler pattern are joined into a broker topic, so this
handler listens on `orders.created`.

## Publishing

Inject `BrokerService` to publish messages:

```ts
import { BrokerService } from '@bunito/broker';
import { Provider } from '@bunito/bunito';

@Provider({
  injects: [BrokerService],
})
class OrdersClient {
  constructor(private readonly broker: BrokerService) {}

  async send(id: string): Promise<string | undefined> {
    const payload = await this.broker.sendRequest('orders.created', { id });

    return payload?.decode();
  }

  emit(id: string): Promise<boolean> {
    return this.broker.sendEvent('orders.created', { id });
  }
}
```

Use `sendRequest()` when a response is expected and `sendEvent()` for
fire-and-forget messages. `BrokerService` wraps public data in a `Payload` before
it reaches an adapter. Request replies are returned as `Payload | undefined`, and
application code can call `payload.decode<T>()` to read the decoded value.

Handlers usually inject decoded data. Adapter-facing code can still work with the
`Payload` object at the adapter boundary:

```ts
import { Data, OnMessage } from '@bunito/broker';

class OrdersController {
  @OnMessage('created', {
    injects: [Data],
  })
  handle(data: Data<{ id: string }>): string {
    return data.id;
  }
}
```

Import `Payload` from `@bunito/broker` when a handler or adapter needs access to
the encoded bytes through `payload.data`.

## Configuration

Common environment values:

```text
BROKER_ADAPTER=local
LOCAL_BROKER_MODE=in-memory
LOCAL_BROKER_TIMEOUT=250
LOCAL_BROKER_DATA_DIR=.bunito/broker
NATS_BROKER_SERVERS=nats://localhost:4222
NATS_BROKER_QUEUE=default
```

App-local `.env` files are loaded by the CLI for workspace apps.

## Testing

Importing `@bunito/broker` registers broker test factories on the shared
`@bunito/testing` `Test` context:

- `Test.BrokerModule`: a `BrokerModule` replacement configured with the
  in-memory `TestBroker` adapter.
- `Test.broker`: the `TestBroker` adapter instance. Its adapter methods are Bun
  mocks.

```ts
import { BrokerService, Payload } from '@bunito/broker';
import { App } from '@bunito/bunito';
import { Test } from '@bunito/testing';

const app = await App.start({
  imports: [Test.ConfigModule, Test.LoggerModule, Test.BrokerModule, AppModule],
});

const broker = await app.resolve(BrokerService);
const payload = await broker.sendRequest('orders.created', { id: 'ord_1' });

expect(payload?.decode()).toEqual({ ok: true });
expect(Test.broker.sendRequest).toBeCalledWith(
  'orders.created',
  expect.any(Payload),
);

await app.shutdown();
```

`TestBroker` uses the same topic matching style as the local broker, including
single-token wildcards and trailing multi-token wildcards. Use
`Test.broker.setTimeout()` when a request/reply test should fail faster.

## Example

See [Microservices](../tutorials/microservices.md) for a small workspace where HTTP
controllers call each other through broker messages.
