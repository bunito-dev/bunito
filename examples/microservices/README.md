# Microservices Example

Three apps showing broker-based communication:

- `foo`: HTTP endpoint plus broker handler for `foo.process`.
- `bar`: HTTP endpoint plus broker handler for `bar.process`.
- `mono`: imports both app modules into one process.

The `foo` and `bar` apps expose HTTP routes and call each other through
`BrokerService.sendRequest()`. The example uses the local broker adapter by
default, configured through app-local `.env` files.

## Commands

```bash
bun run start foo
bun run start bar
bun run start mono
bun run build
```

Run those commands from `examples/microservices`.

## What To Read

- `apps/foo/src/foo-controller.ts`: HTTP route that sends a broker request to
  `bar.process`.
- `apps/bar/src/bar-controller.ts`: mirror route that sends a request to
  `foo.process`.
- `apps/foo/src/foo-module.ts` and `apps/bar/src/bar-module.ts`: broker, logger,
  and HTTP module setup.
- `apps/mono/src/app-module.ts`: composed app importing both modules.
