# Architecture

This is a short overview of how bunito is currently put together.

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
  -> provider resolution and setup
  -> boot hooks
  -> optional server startup when server-related modules are present
```

## Core Concepts

### Modules

Applications are built from plain module objects or classes decorated with `@Module()`.
Modules can define:

- `imports`
- `providers`
- `configs`
- `controllers`
- `routers`
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

- `HttpModule` registers the HTTP router integration
- controllers are discovered from decorator metadata
- route decorators define request, response, and exception behavior
- `zod` can be used for request validation

## Examples

Current examples live in [`examples/`](../examples):

- [`examples/core/001-basics`](../examples/core/001-basics)
- [`examples/http/001-basics`](../examples/http/001-basics)
