# HTTP Examples 🌐

Four HTTP apps in one workspace. The CLI discovers apps from `apps/*/src/main.ts`
and loads each app's `.env` file automatically.

## Commands 🚀

This workspace has only `apps/*` entries, so start a selected app by name or start
all workspace apps with `--all`:

```bash
bun run start simple-controller
bun run start cors-support
bun run start --all
bun run build --all
```

Run those commands from `examples/http`.

## Apps 📦

| App                 | Port   | Shows                                                                              | Requests                                                       |
|---------------------|--------|------------------------------------------------------------------------------------|----------------------------------------------------------------|
| `simple-controller` | `4003` | controllers, params, query values, validation, and service injection               | [`apps/simple-controller.http`](./apps/simple-controller.http) |
| `json-middleware`   | `4001` | JSON serialization, raw body injection, parsed body injection, and body validation | [`apps/json-middleware.http`](./apps/json-middleware.http)     |
| `multiple-apis`     | `4002` | feature modules, route prefixes, module-level middleware, and custom 404 flow      | [`apps/multiple-apis.http`](./apps/multiple-apis.http)         |
| `cors-support`      | `4004` | CORS inheritance, controller-level CORS overrides, and any-method route handling   | Use `curl -i -X OPTIONS http://localhost:4004/foo/bar`         |

Ports are configured in app-local `.env` files.

## What To Read 🔎

- `apps/simple-controller/src/foo-controller.ts`: route decorators and injections.
- `apps/json-middleware/src/foo-controller.ts`: `JSONSerializer`, `Body()`, and
  schema-backed body validation.
- `apps/multiple-apis/src/foo` and `apps/multiple-apis/src/bar`: feature modules
  mounted with different prefixes.
- `apps/cors-support/src/app-module.ts`: app-level `UseCORS` and JSON middleware.
- `apps/cors-support/src/foo`: feature-level CORS overrides and `OnRequest`.
