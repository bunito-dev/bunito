# Architecture

This document describes the current runtime model of Bunito.

The framework is split into three packages:

- `@bunito/common`
- `@bunito/core`
- `@bunito/http`

The example app composes them into a working application.

## High-Level Shape

At runtime, the main flow looks like this:

```text
App.create()
  -> Container
    -> ContainerCompiler
    -> ContainerRuntime
  -> optional Logger
  -> setup entrypoints
  -> bootstrap entrypoints
  -> optional HttpModule / HttpService
```

## Package Roles

### `@bunito/common`

Purpose:

- shared metadata helpers
- shared exception abstraction
- shared predicates and utility types

This package should remain small and dependency-free.

### `@bunito/core`

Purpose:

- define the application runtime model
- provide dependency injection and module compilation
- expose lifecycle hooks
- provide configuration and logger facilities

Main areas:

- `app/`
- `container/`
- `config/`
- `logger/`

### `@bunito/http`

Purpose:

- integrate Bun HTTP serving with the core lifecycle
- discover controller routes from metadata
- execute route handlers through the container
- provide schema-aware request validation

Main areas:

- `http.module.ts`
- `http.service.ts`
- `decorators/`
- `http.exception.ts`

## Application Lifecycle

Applications are created through `App.create(name, moduleRef)`.

Current runtime sequence:

1. create a `Container`
2. compile the root module graph
3. optionally resolve `Logger`
4. register `App` itself into the container
5. run setup entrypoints
6. return the `App`

After creation:

- `app.bootstrap()` triggers provider/module bootstrap hooks
- `app.teardown()` destroys scopes and runs destroy hooks

## Module Model

Modules can be defined as:

- plain `ModuleOptions` objects
- classes decorated with `@Module()`

Modules can currently declare:

- `imports`
- `providers`
- `controllers`
- `exports`

Important note:

- `module.extends` exists in types but is not finalized as a feature yet

### Entrypoints

If a module is defined as a decorated class, that class also acts as the module
entrypoint provider.

That means:

- the module class is registered as a provider
- lifecycle hooks on the module class are discovered like provider hooks
- setup/bootstrap/destroy behavior is driven through the container runtime

## Dependency Injection Model

Providers can be registered as:

- class providers
- factory providers
- value providers

Providers can be resolved by:

- class
- function/factory token
- string token
- symbol token

### Scopes

Supported provider scopes:

- `singleton`
- `module`
- `request`
- `transient`

Current semantics:

- `singleton`: shared by provider-owning module resolution context
- `module`: cached per consumer module context
- `request`: cached per request id
- `transient`: new instance each time

The distinction between `singleton` and `module` is intentional and important.

### Optional Injections

Optional dependencies can be declared through injection descriptors or helpers.
When an optional dependency is missing, `null` is injected instead of throwing.

## Container Internals

### `ContainerCompiler`

Responsible for:

- normalizing module definitions
- compiling imports/providers/controllers/exports
- resolving provider ownership
- detecting circular module dependencies

### `ContainerRuntime`

Responsible for:

- resolving provider instances
- applying scope caches
- constructing provider parameters
- triggering provider lifecycle hooks
- destroying scoped instances

### `Container`

Responsible for:

- tying compiler and runtime together
- exposing provider resolution to consumers
- collecting controller metadata paths for HTTP integration
- managing module entrypoint setup/bootstrap flow

## Logger Model

`LoggerModule` registers the logging system through `@bunito/core`.

Pieces:

- `Logger`
- `LoggerConfig`
- parsers
- formatters

Current built-in formatters:

- `prettify`
- `json`

`Logger` is transient so context can be assigned per module/service/app wrapper.

## Config Model

Configuration is provided through:

- `ConfigService`
- `registerConfig(name, factory)`

`registerConfig()` creates a module-scoped provider that can compute config from:

- environment variables
- CI-specific defaults
- injected helpers from `ConfigService`

## HTTP Runtime Model

`HttpModule` integrates HTTP into the lifecycle.

Current flow:

1. `HttpService` is constructed through DI
2. during setup, it scans `container.controllers`
3. class-level `@Route()` metadata is accumulated across the class stack
4. method-level route metadata is read from controller methods
5. handlers are registered into an internal route table
6. during bootstrap, Bun server is started
7. during destroy, the server is stopped

### Request Handling

For each request:

1. resolve matching handlers by path and method
2. create a request id
3. build `HttpContext`
4. optionally parse and validate `query`, `params`, and `body`
5. resolve controller instance through the container
6. execute handler
7. normalize return value into `Response`
8. capture thrown errors through `HttpException.capture()`

### Current Gaps

The following areas are intentionally not complete yet:

- middleware support
- multipart/form-data support
- richer custom HTTP error formatting

## Example App

The example app demonstrates:

- root module composition
- module classes with lifecycle hooks
- nested route prefixes through `@Route()`
- config registration
- provider/controller injection
- HTTP handler validation with `zod`

It should be treated as the most concrete reference for intended runtime usage.
