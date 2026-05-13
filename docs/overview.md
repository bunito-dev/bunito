# Overview

`bunito` is designed around a small idea: application code should be organized as
plain TypeScript classes, and framework behavior should be added through explicit
modules and decorators.

The result is a framework that feels close to Bun and TypeScript. You define
providers, compose them into modules, and let the container resolve dependencies and
call lifecycle hooks.

## Philosophy

`bunito` favors:

- small packages with clear responsibilities
- explicit dependency lists instead of hidden reflection
- decorators for framework metadata, not business logic
- Bun-native runtime behavior
- examples that show real application structure

The main package, `@bunito/bunito`, gives you the application and container APIs.
Feature packages add focused capabilities. For example, `@bunito/http` adds routes,
HTTP injections, middleware, and exceptions; `@bunito/broker` adds message handlers
and adapters; `@bunito/config` plus `@bunito/logger` handle common application
concerns.

## Modules

Modules group providers and features.

```ts
import { Module } from '@bunito/bunito';

@Module({
  imports: [],
  providers: [],
})
class AppModule {}
```

A module can import other modules, register providers, expose controllers through
feature packages, and configure extensions.

Modules can also export providers for other modules:

```ts
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
class UsersModule {}
```

## Providers

Providers are classes, factories, or values registered in the container. The most
common form is a class provider:

```ts
import { Logger, Provider } from '@bunito/bunito';

@Provider({
  injects: [Logger],
})
class UsersService {
  constructor(private readonly logger: Logger) {}
}
```

The `injects` array is deliberately explicit. It tells bunito which dependencies
should be passed to the constructor or factory.

Use object-based `injects` when names are clearer than constructor order:

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

## Provider Scopes

Providers can live in different scopes:

- `singleton`: one instance for the whole app
- `module`: one instance for a module context
- `request`: one instance for a request context
- `transient`: a new instance whenever it is resolved

Most application services can stay in the default scope. Request scope is backed by
the container request context. HTTP requests, broker messages, and Bun server
websocket events enter that context automatically, so request-scoped providers and
log correlation stay isolated per request.

## Lifecycle

Providers can react to container and application events:

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

Use lifecycle hooks for setup and teardown that belongs to a provider. Keep request
handling and business behavior in normal methods.

## Feature Packages

The framework is split into packages so applications can stay small:

- `@bunito/bunito`: app, modules, providers, config, logger, and common re-exports
  - `@bunito/app`: app bootstrap and app lifecycle primitives
  - `@bunito/container`: dependency injection, modules, providers, scopes, and controllers
  - `@bunito/config`: config factories, environment values, and secrets
  - `@bunito/logger`: injectable logger and output extensions
  - `@bunito/bun`: Bun-specific integrations
  - `@bunito/common`: shared exceptions, predicates, types, and utilities
- `@bunito/http`: routes, middleware, request injections, and HTTP exceptions
- `@bunito/broker`: message handlers, local/NATS adapters, and request/reply APIs

## Examples

Runnable examples live in separate workspaces under `examples/`:

- `examples/basics`: one standard app
- `examples/http`: three HTTP apps discovered from `apps/*/src/main.ts`
- `examples/microservices`: broker apps that call each other through messages
- `examples/monorepo`: several apps plus a shared library

Multi-app examples use app-local `.env` files for ports and broker settings.

Continue with [Modules and Providers](/techniques/modules-and-providers) or jump
straight into [HTTP](/techniques/http) or [Broker](/techniques/broker).
