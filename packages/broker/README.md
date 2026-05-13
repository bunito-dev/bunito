# `@bunito/broker`

Broker support for bunito applications. The package provides a `BrokerModule`,
message-handler decorators, request/event publishing through `BrokerService`, and
local or NATS-backed adapters.

## Installation 📦

```bash
bun add @bunito/broker
```

## Usage ✨

```ts
import { BrokerModule, LocalBrokerModule } from '@bunito/broker';
import { LoggerModule, Module } from '@bunito/bunito';

@Module({
  imports: [LoggerModule, BrokerModule, LocalBrokerModule],
})
export class AppModule {}
```

Handlers are regular controllers:

```ts
import { Data, OnMessage } from '@bunito/broker';
import { Controller } from '@bunito/bunito';

@Controller('orders')
export class OrdersController {
  @OnMessage('created', {
    injects: [Data],
  })
  handleOrder(data: Data<{ id: string }>): string {
    return `processed:${data.id}`;
  }
}
```

Use `BrokerService.sendRequest()` when a reply is expected and
`BrokerService.sendEvent()` for fire-and-forget messages.

## Adapters 🔌

- `LocalBrokerModule`: local development adapter, with in-memory and filesystem
  modes.
- `NatsBrokerModule`: NATS adapter. It uses `@nats-io/transport-node` as an
  optional dependency.

## License

MIT
