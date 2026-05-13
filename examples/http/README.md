# HTTP Examples 🌐

Three HTTP apps in one workspace. The CLI discovers apps from `apps/*/src/main.ts`
and loads each app's `.env` file automatically.

## Commands 🚀

```bash
bun run start simple-controller
bun run start
bun run build
```

Run those commands from `examples/http`.

## Apps 📦

| App                 | Port   | Shows                                                                              | Requests                                                       |
|---------------------|--------|------------------------------------------------------------------------------------|----------------------------------------------------------------|
| `simple-controller` | `4003` | controllers, params, query values, validation, and service injection               | [`apps/simple-controller.http`](./apps/simple-controller.http) |
| `json-middleware`   | `4001` | JSON serialization, raw body injection, parsed body injection, and body validation | [`apps/json-middleware.http`](./apps/json-middleware.http)     |
| `multiple-apis`     | `4002` | feature modules, route prefixes, module-level middleware, and custom 404 flow      | [`apps/multiple-apis.http`](./apps/multiple-apis.http)         |

Ports are configured in app-local `.env` files.

## What To Read 🔎

- `apps/simple-controller/src/foo-controller.ts`: route decorators and injections.
- `apps/json-middleware/src/foo-controller.ts`: `JSONSerializer`, `Body()`, and
  schema-backed body validation.
- `apps/multiple-apis/src/foo` and `apps/multiple-apis/src/bar`: feature modules
  mounted with different prefixes.
