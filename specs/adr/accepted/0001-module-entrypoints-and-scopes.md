# ADR 0001: Module Entrypoints And Scope Semantics

| Field  | Value                      |
|--------|----------------------------|
| Status | Accepted                   |
| Date   | 2026-03-27                 |
| Tags   | core, di, modules, runtime |
| Issue  | None                       |
| PR     | None                       |

## Context

Bunito modules can be defined as classes decorated with `@Module()` or as plain
`ModuleOptions` objects. The framework needs a simple way to express module
lifecycle behavior without introducing a separate special-case runtime concept.

At the same time, the DI container supports multiple scopes and needs a clear
distinction between a true shared instance and an instance tied to module
context.

## Decision

- A decorated module class acts as the module entrypoint provider.
- Lifecycle hooks such as `@Setup()`, `@Bootstrap()`, and `@Destroy()` are
  discovered and executed through provider hook machinery.
- `module` scope is intentionally different from `singleton`.
- `module` scope is cached by consumer module context.

## Alternatives Considered

### Separate Module Lifecycle System

Treat module lifecycle as a runtime concept distinct from providers.

- Pros: more explicit separation between modules and providers
- Cons: more framework machinery and more concepts to learn

### Treat Module Scope As Singleton

Avoid a dedicated module-oriented cache model and reuse singleton semantics.

- Pros: simpler mental model at first glance
- Cons: loses an important distinction between global sharing and
  consumer-module-local sharing

## Consequences

### Benefits

- the runtime model stays compact
- module lifecycle does not require a separate mechanism
- provider and module behavior compose naturally
- the distinction between global sharing and module-local sharing remains
  explicit

### Trade-Offs

- the semantics are slightly less familiar than some larger DI frameworks
- `module` scope must be documented carefully to avoid confusion
- the future `module.extends` feature must respect these choices

## Follow-Up

- keep module scope semantics covered in tests and docs
- revisit this decision if `module.extends` evolves into a stronger inheritance
  or composition model

## References

- Related ADRs: None
- Docs: `@bunito/core` container and module runtime
