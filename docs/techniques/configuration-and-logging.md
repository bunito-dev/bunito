# Configuration And Logging

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
  constructor(private readonly logger: Logger) {
    this.logger.setContext(UsersService);
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

The logger is intentionally injectable. A service can set its context once and keep
logging calls local to the behavior it owns.

## Config Values

Use `defineConfig` to create typed config providers:

```ts
import { ConfigModule, defineConfig, Module } from '@bunito/bunito';

const ServerConfig = defineConfig('server', (config) => ({
  port: config.getEnv('PORT', 'port') ?? 3000,
}));

@Module({
  imports: [ConfigModule],
  configs: [ServerConfig],
})
class AppModule {}
```

Config factories receive `ConfigService`. It can read environment values and format
them as strings, booleans, numbers, or ports.

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

## Good Defaults

For most apps:

- import `LoggerModule` early
- keep config factories small
- parse values at the boundary, not deep inside services
- inject ready-to-use config objects into providers

Continue with [HTTP](/techniques/http) to see config and logger used in web apps.
