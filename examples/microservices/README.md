# Microservices Example 📡

Three apps showing broker-based communication:

- `main`: imports both app modules into one process.
- `foo`: HTTP endpoint plus broker handler for `foo.process`.
- `bar`: HTTP endpoint plus broker handler for `bar.process`.

The `foo` and `bar` apps expose HTTP routes and call each other through
`BrokerService.sendRequest()`. The example uses the local broker adapter by
default, configured through app-local `.env` files.

## Commands 🚀

`bun run start` starts every discovered app. Pass `foo` and `bar` to run only the
separate workspace apps, or use `--root` when you want only the composed root app:

```bash
bun run start
bun run start foo
bun run start bar
bun run start --root
```

Run those commands from `examples/microservices`.

## What To Read 🔎

- `apps/foo/src/foo.controller.ts`: HTTP route that sends a broker request to
  `bar.process`.
- `apps/bar/src/bar.controller.ts`: mirror route that sends a request to
  `foo.process`.
- `apps/foo/src/foo.module.ts` and `apps/bar/src/bar.module.ts`: app module setup.
- `libs/client/src/client.service.ts`: shared broker request client.
- `src/main.ts`: composed app importing both modules.
