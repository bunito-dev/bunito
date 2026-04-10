# Architecture

This is a short overview of the current bunito runtime model.

## Packages

- `@bunito/common`: shared metadata helpers, predicates, and exception primitives
- `@bunito/core`: `App`, DI container, modules, config, and logger
- `@bunito/http`: HTTP module, routing decorators, request processing, and validation

## Runtime Shape

High-level flow:

```text
App.create()
  -> Container
    -> ContainerCompiler
    -> ContainerRuntime
  -> optional Logger
  -> setup hooks
  -> app.boot()
    -> boot hooks
    -> optional HttpModule startup
```

## Core Concepts

### Modules

Applications are composed from plain module objects or classes decorated with `@Module()`.
Modules can define:

- `imports`
- `providers`
- `controllers`
- `exports`

### Providers

Providers can be registered as:

- classes
- factories
- values

Supported scopes:

- `singleton`
- `module`
- `request`
- `transient`

### HTTP

`@bunito/http` builds on `@bunito/core`:

- `HttpModule` integrates the server with lifecycle hooks
- `RoutingService` discovers handlers from controller metadata
- route decorators define request and response behavior
- `zod` can be used for request validation

## Examples

Current examples live in [`examples/`](../examples):

- [`examples/core/001-basics`](../examples/core/001-basics)
- [`examples/http/001-basics`](../examples/http/001-basics)
