# bunito examples

This workspace contains small runnable applications that show the current bunito
API in focused steps.

Run commands from this directory:

```bash
cd example
```

## Examples

### `basics`

Providers, dependency injection, logger usage, manual provider resolution, and app
lifecycle hooks.

```bash
bun run start basics
```

### `http-json-middleware`

JSON middleware, raw request body injection, parsed body injection, and body
validation.

```bash
bun run start http-json-middleware
```

Server port: `4001`

Example requests are available in
[`apps/http-json-middleware/requests.http`](./apps/http-json-middleware/requests.http).

### `http-multiple-apis`

Multiple feature modules, route prefixes, module-level middleware, JSON responses,
and custom not-found handling.

```bash
bun run start http-multiple-apis
```

Server port: `4002`

### `http-simple-controller`

HTTP module setup with a controller, route decorators, route params, query values,
and Zod-backed validation.

```bash
bun run start http-simple-controller
```

Server port: `4003`

## Running All Apps

```bash
bun run start:all
```
