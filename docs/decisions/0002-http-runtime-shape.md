# ADR 0002: HTTP Runtime Shape

## Status

Accepted for the current implementation.

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
- Validation is handled through optional `zod` schemas attached to handler metadata.

## Consequences

Positive:

- route declaration stays concise
- request execution remains centralized in `HttpService`
- controller instances still participate fully in DI and scope handling
- validation stays opt-in and local to each route

Trade-offs:

- middleware support needs an explicit design before being added
- error response customization is currently limited
- route metadata and request shaping rules must stay stable and well-documented

## Notes

This ADR intentionally does not cover middleware, multipart handling, or custom
error shaping. Those are expected follow-up decisions once the base HTTP flow is
fully stabilized.
