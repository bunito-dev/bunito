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

  send(id: string): Promise<string> {
    return this.broker.sendRequest<string>('orders.created', { id });
  }

  emit(id: string): Promise<boolean> {
    return this.broker.sendEvent('orders.created', { id });
  }
}
```

Use `sendRequest()` when a response is expected and `sendEvent()` for
fire-and-forget messages.

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

App-local `.env` files are loaded by the CLI for monorepo apps.

## Example

See [Microservices](/tutorials/microservices) for a small workspace where HTTP
controllers call each other through broker messages.
