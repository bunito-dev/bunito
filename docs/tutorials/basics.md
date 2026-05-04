# Basics

This tutorial mirrors the `101-basics` example. It shows providers, dependency
injection, logger usage, manual provider resolution, and lifecycle hooks.

## Install

Start with the CLI:

```bash
bun install --global @bunito/cli
```

Install the core package in your project:

```bash
bun add @bunito/bunito
```

Configure TypeScript:

```json
{
  "extends": "@bunito/bunito/tsconfig.json"
}
```

## Create A Provider

```ts
import {
  Logger,
  OnAppShutdown,
  OnAppStart,
  OnDestroy,
  OnInit,
  Provider,
} from '@bunito/bunito';

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
  injects: [Logger, BarService],
})
class FooService {
  constructor(
    private readonly logger: Logger,
    private readonly barService: BarService,
  ) {
    logger.setContext(FooService);
  }

  fooBar(): string {
    return `foo -> ${this.barService.bar()}`;
  }
}
```

The order of `injects` matches the constructor arguments.

## Create And Start The App

```ts
import { App, LoggerModule } from '@bunito/bunito';

const app = await App.create({
  imports: [LoggerModule],
  providers: [FooService, BarService],
});

const foo = await app.resolve(FooService);

foo.fooBar();

await app.start();
await app.shutdown();
```

`App.create()` builds the container. `app.resolve()` lets scripts or small apps pull
providers directly from it.

## Add `bunito.json`

```json
{
  "apps": {
    "101-basics": {
      "entry": "apps/101-basics/main.ts"
    }
  }
}
```

Run it:

```bash
bunito start 101-basics
```

Next, build an HTTP controller in [Simple Controller](/tutorials/simple-controller).
