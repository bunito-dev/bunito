# Modules And Providers

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
`HttpModule`; JSON body handling adds `JSONModule`.

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
import { OnBoot, OnDestroy, OnInit, Provider } from '@bunito/bunito';

@Provider()
class Worker {
  @OnInit()
  onInit(): void {}

  @OnBoot()
  onBoot(): void {}

  @OnDestroy()
  onDestroy(): void {}
}
```

Use them for setup, boot-time actions, and teardown. Keep normal application logic in
regular methods.

## Where To Go Next

- Use config and logging in [Configuration And Logging](/techniques/configuration-and-logging).
- Build controllers in [HTTP](/techniques/http).
- Walk through the full first app in [Basics](/tutorials/basics).
