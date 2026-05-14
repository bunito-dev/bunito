# Basics

This tutorial mirrors the `examples/basics` workspace. It shows providers, dependency
injection, logger usage, manual provider resolution, and lifecycle hooks.

## Install

Run the CLI without installing it globally:

```bash
bunx @bunito/cli --help
```

Or install it globally if you want the `bunito` binary available everywhere:

```bash
bun install --global @bunito/cli
```

Install the core package and CLI in your project:

```bash
bun add @bunito/bunito
bun add -d @bunito/cli
```

Configure TypeScript:

```json
{
  "extends": "@bunito/bunito/tsconfig.json"
}
```

## Create A Provider

```ts
import { Logger, OnAppShutdown, OnAppStart, OnDestroy, OnInit, Provider } from '@bunito/bunito';

@Provider({
  injects: [Logger],
})
class BarService {
  constructor(private readonly logger: Logger) {
    logger.setContext(BarService);
  }

  @OnInit()
  onInit(): void {
    this.logger.debug('onInit() called');
  }

  @OnAppStart()
  onAppStart(): void {
    this.logger.debug('onAppStart() called');
  }

  @OnAppShutdown()
  onAppShutdown(): void {
    this.logger.debug('onAppShutdown() called');
  }

  @OnDestroy()
  onDestroy(): void {
    this.logger.debug('onDestroy() called');
  }

  bar(): string {
    return 'bar';
  }
}
```

`BarService` is a provider. The container creates it and injects `Logger` into the
constructor.

## Inject One Provider Into Another

```ts
@Provider({
  injects: {
    logger: Logger,
    barService: BarService,
  },
})
class FooService {
  private readonly logger: Logger;
  private readonly barService: BarService;

  constructor(options: { logger: Logger; barService: BarService }) {
    const { logger, barService } = options;
    logger.setContext(FooService);

    this.logger = logger;
    this.barService = barService;
  }

  fooBar(): string {
    return `foo -> ${this.barService.bar()}`;
  }
}
```

Object-based `injects` keeps dependencies named. Array-based `injects` is also
available when constructor argument order is enough.

## Create And Start The App

```ts
import { App, Logger, LoggerModule, Module, OnAppStart } from '@bunito/bunito';

@Module({
  imports: [LoggerModule],
  providers: [FooService, BarService],
  injects: [Logger],
})
class AppModule {
  constructor(private readonly logger: Logger) {
    this.logger.setContext(AppModule);
  }

  @OnAppStart()
  onStart(): void {
    this.logger.debug('onStart() called');
  }
}

const app = await App.create(AppModule);

const foo = await app.resolve(FooService);

foo.fooBar();

await app.start();
await app.shutdown();
```

`App.create()` builds the container. `app.resolve()` lets scripts or small apps pull
providers directly from it.

## Run The Example

In the repository examples, this app lives at
`examples/basics/src/main.ts`. The CLI discovers it as a standard app.

Run it:

```bash
cd examples/basics
bun run start
```

Next, build an HTTP controller in [Simple Controller](./simple-controller.md).
