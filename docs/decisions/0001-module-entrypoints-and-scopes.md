# ADR 0001: Module Entrypoints And Scope Semantics

## Status

Accepted for the current implementation.

## Context

Bunito modules can be defined as classes decorated with `@Module()` or as plain
`ModuleOptions` objects. The framework needs a simple way to express module
lifecycle behavior without introducing a separate special-case runtime concept.

At the same time, the DI container supports multiple scopes and needs a clear
distinction between a true shared instance and an instance tied to module context.

## Decision

- A decorated module class acts as the module entrypoint provider.
- Lifecycle hooks such as `@Setup()`, `@Bootstrap()`, and `@Destroy()` are
  discovered and executed through provider hook machinery.
- `module` scope is intentionally different from `singleton`.
- `module` scope is cached by consumer module context.

## Consequences

Positive:

- the runtime model stays compact
- module lifecycle does not require a separate mechanism
- provider and module behavior compose naturally
- the distinction between global sharing and module-local sharing remains explicit

Trade-offs:

- the semantics are slightly less familiar than some larger DI frameworks
- `module` scope must be documented carefully to avoid confusion
- the future `module.extends` feature must respect these choices

## Notes

This ADR describes the current intended model. If `module.extends` evolves into a
stronger inheritance/composition system, this decision may need to be revisited.
