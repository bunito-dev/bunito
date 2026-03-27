# Roadmap

This roadmap reflects the current likely direction of the project. It is not a
strict release plan, but a guide to what should be stabilized next.

## Near Term

### Core

- finalize `module.extends`
- keep DI/module semantics explicit and well-documented
- polish lifecycle and logger ergonomics

### HTTP

- add middleware support
- improve error response customization
- add multipart/form-data handling
- clarify route parameter and request-shaping semantics

### Documentation

- keep README and architecture docs aligned with implementation
- add a more guided “Getting Started” flow

## Mid Term

- define the first stable public API boundary for each package
- make extension points clearer for logging, HTTP, and configuration
- add more example applications showing different composition styles

## Longer Term

- CI/release automation beyond basic validation
- versioning and release discipline for packages
- stronger ecosystem-level docs for third-party decorators, modules, and extensions

## Non-Goals For Now

The project should resist premature expansion.

That means:

- avoid adding many features before the module and HTTP runtime stories are stable
- avoid turning `@bunito/common` into a generic dumping ground
- avoid making decorators “smarter” at the expense of transparent runtime behavior
