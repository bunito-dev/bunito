# Specs

This directory contains long-lived technical records for Bunito.

The main purpose of `specs/` today is to store Architecture Decision Records
(ADRs): concise documents that explain why an important technical decision was
made, what alternatives were considered, and what consequences follow from it.

## When To Write An ADR

Create or update an ADR when a decision:

- changes runtime architecture or dependency injection semantics
- affects public API shape or package boundaries
- introduces a meaningful long-term trade-off
- should be easy to revisit later with clear historical context

## Structure

```text
specs/
  README.md
  adr/
    drafts/
    accepted/
    superseded/
    rejected/
    template.md
```

- `adr/drafts/` contains proposals still being discussed.
- `adr/accepted/` contains approved decisions that describe the current direction.
- `adr/superseded/` contains older decisions replaced by newer ADRs.
- `adr/rejected/` contains proposals that were intentionally not adopted.
- `adr/template.md` is the starting point for new records.

## ADR Lifecycle

An ADR usually moves through this flow:

`draft` -> `accepted` or `rejected` -> optionally `superseded`

When an ADR is replaced, keep the old document and move it to `superseded/`
instead of deleting history.

## Issues And ADRs

Use issues and ADRs for different jobs:

- Use an issue when the main need is to track a bug, feature, task, or open
  discussion.
- Use an ADR when the main need is to record an architectural or long-lived
  technical decision.
- Use both when the work starts as a discussion or problem report and ends with
  a decision that should stay easy to revisit later.

A practical flow is:

`issue` -> `ADR` -> `PR`

- the issue captures the problem, scope, and discussion
- the ADR captures the final decision and its consequences
- the PR implements the decision

Link ADRs to related issues or PRs when they exist, but do not treat this as a
hard requirement. Some decisions will be written directly from implementation
work or maintainer discussion.

## Naming

Use a numeric prefix and a short slug:

- `0001-module-entrypoints-and-scopes.md`
- `0002-http-runtime-shape.md`

Keep numbering stable once a file is created. Do not renumber older ADRs just
because a draft is removed or rejected.

## Template Notes

The ADR template uses a small metadata table at the top so the most important
state is visible immediately.

Suggested fields:

- `Status`: `Draft`, `Accepted`, `Rejected`, or `Superseded`
- `Date`: creation or last status update date in `YYYY-MM-DD`
- `Tags`: optional short descriptors such as `core`, `http`, `di`, `runtime`
- `References`: optional links to related issues, PRs, docs, or ADRs

## ADR Template

See [`adr/template.md`](./adr/template.md) for the canonical format.
