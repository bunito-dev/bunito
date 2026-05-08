# Monorepo

This tutorial mirrors the `examples/monorepo` workspace. It shows how the CLI
discovers several apps and how apps can share modules from `libs/*`.

## Shared Library

The shared library exports a module and provider:

```ts
import { Module } from '@bunito/bunito';
import { ExampleService } from './example.service';

@Module({
  providers: [ExampleService],
  exports: [ExampleService],
})
class ExampleModule {}
```

`ExampleService` uses an optional logger dependency, so the library can be imported
by apps that do or do not register `LoggerModule`.

## Feature Apps

The `first` and `second` apps import the shared module:

```ts
import { LoggerModule, Module } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { FirstService } from './first.service';

@Module({
  imports: [LoggerModule, ExampleModule],
  providers: [FirstService],
})
class AppModule {}
```

Each app has its own `apps/<name>/src/main.ts`, so it can be started separately.

## Composed App

The `mono` app composes both app modules:

```ts
import { Module } from '@bunito/bunito';
import { AppModule as FirstModule } from '@apps/first';
import { AppModule as SecondModule } from '@apps/second';

@Module({
  imports: [FirstModule, SecondModule],
})
class AppModule {}
```

This is useful when several small apps should also be available through one
combined entrypoint.

## Run The Example

```bash
cd examples/monorepo
bun run start first
bun run start second
bun run start mono
```

Build every discovered app:

```bash
bun run build
```
