# ADR 0002: HTTP Runtime Shape

| Field  | Value                              |
|--------|------------------------------------|
| Status | Accepted                           |
| Date   | 2026-03-27                         |
| Tags   | http, runtime, routing, validation |
| Issue  | None                               |
| PR     | None                               |

## Context

The HTTP package is intended to stay small and to build directly on top of the
core container and module lifecycle. It needs a route declaration model that is
simple to read in code and a runtime path that stays explicit.

## Decision

- HTTP routing is metadata-driven through decorators.
- Class-level `@Route()` metadata contributes path prefixes.
- Method-level decorators such as `@Get()` and `@Post()` declare handlers.
- `HttpService` resolves controller handlers during setup and serves requests
  through `Bun.serve`.
- Validation is handled through optional `zod` schemas attached to handler
  metadata.

## Alternatives Considered

### Code-First Manual Router Registration

Register routes imperatively in module setup instead of using decorators.

- Pros: less metadata machinery and more explicit registration flow
- Cons: noisier controller code and weaker alignment with the rest of the
  decorator-based runtime

### Introduce Middleware Before Stabilizing Routing

Design a broader HTTP abstraction up front instead of keeping the initial runtime
small.

- Pros: more feature-complete HTTP story earlier
- Cons: higher complexity before the base request flow is well understood

## Consequences

### Benefits

- route declaration stays concise
- request execution remains centralized in `HttpService`
- controller instances still participate fully in DI and scope handling
- validation stays opt-in and local to each route

### Trade-Offs

- middleware support needs an explicit design before being added
- error response customization is currently limited
- route metadata and request shaping rules must stay stable and well-documented

## Follow-Up

- define ADRs for middleware and richer error shaping when those areas are ready
- keep request validation behavior documented and tested

## References

- Related ADRs: None
- Docs: `@bunito/http` route decorators, `@bunito/http` `HttpService`
