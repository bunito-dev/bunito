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
Feature packages add focused capabilities. For example, `@bunito/http` adds
controllers and routing, while `@bunito/config` and `@bunito/logger` handle common
application concerns.

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

## Provider Scopes

Providers can live in different scopes:

- `singleton`: one instance for the whole app
- `module`: one instance for a module context
- `request`: one instance for a request context
- `transient`: a new instance whenever it is resolved

Most application services can stay in the default scope. Request scope is useful
when a provider depends on request-specific data.

## Lifecycle

Providers can react to container and application events:

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

Use lifecycle hooks for setup and teardown that belongs to a provider. Keep request
handling and business behavior in normal methods.

## Feature Packages

The framework is split into packages so applications can stay small:

- `@bunito/bunito`: app, modules, providers, config and logger re-exports
- `@bunito/http`: controllers, routes, middleware, injections, and HTTP exceptions
- `@bunito/config`: config factories, environment values, and secrets
- `@bunito/logger`: injectable logger and output extensions
- `@bunito/bun`: Bun-specific integrations

Continue with [Modules And Providers](/techniques/modules-and-providers) or jump
straight into [HTTP](/techniques/http).
