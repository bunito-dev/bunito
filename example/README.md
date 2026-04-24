# bunito examples

This workspace contains small runnable applications that show the current bunito
API in focused steps.

Run commands from this directory:

```bash
cd example
```

## Examples

### `101-basics`

Providers, dependency injection, logger usage, manual provider resolution, and app
lifecycle hooks.

```bash
bun run start:101-basics
```

### `201-simple-controller`

HTTP module setup with a controller, route decorators, route params, query values,
and Zod-backed validation.

```bash
bun run start:201-simple-controller
```

Server port: `4201`

### `202-json-middleware`

JSON middleware, raw request body injection, parsed body injection, and body
validation.

```bash
bun run start:202-json-middleware
```

Server port: `4202`

Example requests are available in
[`apps/202-json-middleware/example.http`](./apps/202-json-middleware/example.http).

### `203-multiple-apis`

Multiple feature modules, route prefixes, module-level middleware, JSON responses,
and custom not-found handling.

```bash
bun run start:203-multiple-apis
```

Server port: `4203`

## Running All Apps

```bash
bun run start:all
```

The app list and per-app environment values are defined in
[`bunito.json`](./bunito.json).
