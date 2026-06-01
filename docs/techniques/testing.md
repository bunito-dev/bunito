# Testing

`@bunito/testing` provides a shared `Test` context plus small helpers for Bun test
suites. Feature packages can register their own test factories on that context, so
tests can swap runtime integrations for deterministic in-memory modules.

## Test Context

Import `Test` from `@bunito/testing` in test files:

```ts
import { describe, expect, test } from 'bun:test';
import { App } from '@bunito/bunito';
import { Test } from '@bunito/testing';

describe('feature', () => {
  test('uses test modules', async () => {
    const app = await App.start({
      imports: [Test.ConfigModule, Test.LoggerModule, AppModule],
    });

    await app.shutdown();
  });
});
```

Factories are registered lazily by importing the feature package that owns them.
For example, importing `@bunito/bun`, `@bunito/config`, `@bunito/logger`, or
`@bunito/broker` makes that package's `Test.*` helpers available.

## Core Helpers

`@bunito/testing` exports:

- `Test`: the shared context used by package and example tests.
- `defineTestFactory()`: registers a lazy value on `Test`.
- `mockClass()`: creates a Bun-mocked object from a class prototype.
- `spyOnObject()`: spies on methods from an object prototype chain.
- `TestException`: an exception type for testing helpers.

Use `defineTestFactory()` when a reusable test value should be created only when a
test first reads it:

```ts
import type { MockedObject } from '@bunito/testing';
import { Test, defineTestFactory, mockClass } from '@bunito/testing';

class Mailer {
  send(): void {}
}

declare global {
  namespace Bunito {
    interface Test {
      mailer: MockedObject<Mailer>;
    }
  }
}

defineTestFactory('mailer', () => mockClass(Mailer));

expect(Test.mailer.send).not.toBeCalled();
```

## Feature Test Modules

Several feature packages register ready-to-use modules:

- `@bunito/config`: `Test.ConfigModule`, `Test.configService`, and
  `Test.defineConfig`.
- `@bunito/logger`: `Test.LoggerModule` and `Test.getLogger`.
- `@bunito/bun`: `Test.BunServerModule`, `Test.bunServerFactory`,
  `Test.bunServer`, `Test.BunSecretsModule`, and `Test.bunSecretsService`.
- `@bunito/broker`: `Test.BrokerModule` and `Test.broker`.

These modules are normal module options. Put them before the runtime module they
replace when another feature imports that runtime module automatically:

```ts
import '@bunito/bun';

import { App } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { Test } from '@bunito/testing';

const app = await App.start({
  imports: [Test.BunServerModule, Test.LoggerModule, HTTPModule, AppModule],
});

const response = await Test.bunServer
  .buildRequest('/health')
  .withMethod('GET')
  .send();

expect(response.status).toBe(200);

await app.shutdown();
```

## Coverage

Package-local `src/testing/**` helpers are intended to support other tests. They
are ignored by coverage and do not need dedicated sibling test files.

Continue with [Configuration and Logging](./configuration-and-logging.md) for
configuration and logger test modules.
