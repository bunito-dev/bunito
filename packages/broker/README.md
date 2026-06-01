# `@bunito/broker`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

Messaging support for bunito applications. The package provides `BrokerModule`,
message-handler decorators, request/reply and event publishing through
`BrokerService`, plus local and NATS-backed adapters.

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
`BrokerService.sendEvent()` for fire-and-forget messages. Public payloads are
encoded before they reach adapters; handlers usually inject decoded `Data()`.

## Testing 🧪

Importing `@bunito/broker` registers broker test factories on the shared
`@bunito/testing` `Test` context:

- `Test.BrokerModule`: a `BrokerModule` replacement configured with the
  in-memory `TestBroker` adapter.
- `Test.broker`: the `TestBroker` instance. Its adapter methods are Bun mocks,
  so calls such as `sendRequest`, `sendEvent`, `sendResponse`, `connect`,
  `disconnect`, and `subscribe` can be asserted directly.

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
```

`Test.broker` supports the same topic matching as the local broker, including
single-token and trailing multi-token wildcards. Use `Test.broker.setTimeout()`
when a request/reply test needs a shorter timeout.

## Adapters 🔌

- `LocalBrokerModule`: local development adapter, with in-memory and filesystem
  modes.
- `NatsBrokerModule`: NATS adapter. It uses `@nats-io/transport-node` as an
  optional dependency.

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fbroker
[npm-url]: https://www.npmjs.com/package/@bunito/broker
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
