# Configuration and Logging

`@bunito/bunito` re-exports the public configuration and logger APIs, so most apps
can import them from one place.

## Logger

Add `LoggerModule` to the app and inject `Logger` into providers:

```ts
import { Logger, LoggerModule, Module, Provider } from '@bunito/bunito';

@Provider({
  injects: [Logger],
})
class UsersService {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  findAll(): string[] {
    this.logger.debug('findAll() called');

    return [];
  }
}

@Module({
  imports: [LoggerModule],
  providers: [UsersService],
})
class AppModule {}
```

The logger is intentionally injectable. A service can create a tracked logger once
and keep logging calls local to the behavior it owns.

## Config Values

Use `defineConfig` to create typed config providers. A config provider can read
environment values through `ConfigService` and can be injected like any other
provider token:

```ts
import { ConfigModule, defineConfig, Module, Provider } from '@bunito/bunito';
import type { ResolveConfig } from '@bunito/bunito';

const ServerConfig = defineConfig(function ServerConfig({ getEnv }) {
  return {
    port: getEnv?.('PORT', 'port') ?? 3000,
  };
});

@Provider({
  injects: [ServerConfig],
})
class ServerStatus {
  constructor(private readonly config: ResolveConfig<typeof ServerConfig>) {}

  url(): string {
    return `http://localhost:${this.config.port}`;
  }
}

@Module({
  imports: [ConfigModule],
  configs: [ServerConfig],
  providers: [ServerStatus],
})
class AppModule {}
```

Config factories receive `ConfigService`. It can read environment values and format
them as strings, lowercase/uppercase strings, booleans, integers, decimals, or
ports. Values that are missing return `undefined`, so defaults should be applied in
the factory.

## Secrets

Secret lookup goes through config extensions. The Bun integration package provides
Bun secrets support:

```ts
import { BunSecretsModule } from '@bunito/bun';
import { ConfigModule, Module } from '@bunito/bunito';

@Module({
  imports: [ConfigModule, BunSecretsModule],
})
class AppModule {}
```

Use secrets for values that should not be stored directly in environment variables
or source files.

## Testing

Importing `@bunito/config` and `@bunito/logger` registers their test factories on
the shared `Test` context from `@bunito/testing`.

For configuration-heavy code, use `Test.ConfigModule` to replace real environment
and secret readers with a mocked `ConfigService`. Use `Test.defineConfig()` when a
module expects a typed config provider:

```ts
import { ConfigService, defineConfig } from '@bunito/config';
import { App } from '@bunito/bunito';
import { Test } from '@bunito/testing';

const ServerConfig = defineConfig(function ServerConfig() {
  return {
    port: 3000,
  };
});

const app = await App.start({
  imports: [Test.ConfigModule],
  configs: [
    Test.defineConfig(ServerConfig, {
      port: 53100,
    }),
  ],
});

expect(await app.resolve(ConfigService)).toBe(Test.configService);

await app.shutdown();
```

For logger assertions, import `Test.LoggerModule` and read the contextual
`TestLogger` with `Test.getLogger()`:

```ts
const app = await App.start({
  imports: [Test.LoggerModule],
  providers: [UsersService],
});

const users = await app.resolve(UsersService);

users.findAll();

expect(Test.getLogger(UsersService).debug).toBeCalledWith('findAll() called');

await app.shutdown();
```

`TestLogger` methods are Bun mocks, so normal `bun:test` mock assertions work for
`debug`, `info`, `warn`, `error`, `track`, and the other logger methods.

## Good Defaults

For most apps:

- import `LoggerModule` early
- keep config factories small
- parse values at the boundary, not deep inside services
- inject ready-to-use config objects into providers

Continue with [HTTP](../techniques/http.md) to see config and logger used in web apps.
