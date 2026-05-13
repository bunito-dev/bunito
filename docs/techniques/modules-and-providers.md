# Modules and Providers

Modules and providers are the core building blocks of a bunito application.

## Providers

A provider is a value the container can resolve. Most providers are classes:

```ts
import { Logger, Provider } from '@bunito/bunito';

@Provider({
  injects: [Logger],
})
class UsersService {
  constructor(private readonly logger: Logger) {}
}
```

The `injects` array defines constructor dependencies in order. This keeps runtime
behavior explicit and friendly to TypeScript and Bun.

When dependency names are more useful than position, use object-based injections:

```ts
@Provider({
  injects: {
    logger: Logger,
  },
})
class UsersService {
  private readonly logger: Logger;

  constructor(options: { logger: Logger }) {
    this.logger = options.logger;
  }
}
```

## Modules

A module groups providers and imports other modules:

```ts
import { LoggerModule, Module } from '@bunito/bunito';

@Module({
  imports: [LoggerModule],
  providers: [UsersService],
})
class AppModule {}
```

Modules are also how feature packages plug into an app. For example, HTTP apps add
`HTTPModule`, and message-driven apps add `BrokerModule` plus an adapter module.

Export providers when another module should be able to inject them:

```ts
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
class UsersModule {}
```

## Resolving Providers Manually

For scripts and small apps, you can create an app from module options and resolve
providers directly:

```ts
import { App, LoggerModule } from '@bunito/bunito';

const app = await App.create({
  imports: [LoggerModule],
  providers: [UsersService],
});

const usersService = await app.resolve(UsersService);

await app.start();
await app.shutdown();
```

This pattern is useful for workers, scripts, and tests.

## Lifecycle Hooks

Providers can define lifecycle hooks:

```ts
import { OnAppStart, OnDestroy, OnInit, Provider } from '@bunito/bunito';

@Provider()
class Worker {
  @OnInit()
  onInit(): void {}

  @OnAppStart()
  onAppStart(): void {}

  @OnDestroy()
  onDestroy(): void {}
}
```

Use them for setup, app-start actions, and teardown. Keep normal application logic
in regular methods, and keep hooks idempotent enough that failures are easy to
diagnose.

## Where To Go Next

- Use config and logging in [Configuration and Logging](/techniques/configuration-and-logging).
- Build controllers in [HTTP](/techniques/http).
- Add message handlers in [Broker](/techniques/broker).
- Walk through the full first app in [Basics](/tutorials/basics).
