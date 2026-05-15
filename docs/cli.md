# CLI

The `bunito` CLI runs, builds, and generates bunito projects. It discovers project
shape from the filesystem instead of a project config file.

Install it globally if you want the `bunito` binary available everywhere:

```bash
bun install --global @bunito/cli
```

Run it without a global install through `bunx`:

```bash
bunx @bunito/cli --help
```

## Project Discovery

A bunito project is any directory, or parent directory, whose `package.json`
depends on `@bunito/bunito`.

The CLI supports one main app and optional workspace apps:

- main app: `src/main.ts`
- workspace apps: `apps/<name>/src/main.ts`
- shared libraries: `libs/<name>/index.ts`

Optional environment files are discovered automatically:

- main app: `.env`
- workspace apps: `apps/<name>/.env`

## Commands

Start the main app:

```bash
bunito start
```

Start selected workspace apps or every workspace app:

```bash
bunito start simple-controller
bunito start json-middleware multiple-apis
bunito start --all
```

Useful start flags:

```bash
bunito start --watch
bunito start --prod
bunito start --label name
```

Build the main app into `out/main.js`, or build selected workspace apps into
`out/<name>/main.js`:

```bash
bunito build
bunito build simple-controller --minify --sourcemap
bunito build --all
```

Generate files:

```bash
bunito init my-app
bunito init my-workspace --app api --app admin
bunito generate app worker
bunito generate lib shared-auth
```

Use `--cwd` when running the CLI from outside the project directory:

```bash
bunito --cwd examples/http start simple-controller
```

## Package Scripts

Each example workspace keeps scripts small:

```json
{
  "scripts": {
    "cli": "bunito",
    "build": "bunito build",
    "start": "bunito start"
  }
}
```

Run all workspace apps in a multi-app example:

```bash
cd examples/http
bun run start --all
```

Run one example app:

```bash
cd examples/http
bun run start json-middleware
```

Build the examples:

```bash
cd examples/http
bun run build
```

## Repository Examples

The repository keeps examples as separate workspaces:

```text
examples/
  basics/
    src/main.ts
  http/
    apps/
      json-middleware/
        .env
        src/main.ts
      multiple-apis/
        .env
        src/main.ts
      simple-controller/
        .env
        src/main.ts
      cors-support/
        .env
        src/main.ts
  microservices/
    apps/
      foo/
        .env
        src/main.ts
      bar/
        .env
        src/main.ts
      mono/
        .env
        src/main.ts
  monorepo/
    apps/
      first/
        src/main.ts
      second/
        src/main.ts
      mono/
        src/main.ts
    libs/
      example/
        index.ts
```

`.env` files are app-local. For example, `examples/http/apps/json-middleware/.env`
sets the port for only the `json-middleware` app. The CLI always passes the matching
`.env` file when it starts an app.

The tutorials explain those apps step by step:

- [Basics](./tutorials/basics.md)
- [Simple Controller](./tutorials/simple-controller.md)
- [JSON Middleware](./tutorials/json-middleware.md)
- [Multiple APIs](./tutorials/multiple-apis.md)
- [CORS Support](./tutorials/cors-support.md)
- [Microservices](./tutorials/microservices.md)
- [Monorepo](./tutorials/monorepo.md)
