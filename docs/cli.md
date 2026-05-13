# CLI

The `bunito` CLI runs, builds, and generates bunito projects. It discovers project
shape from the filesystem instead of a project config file.

Install it globally:

```bash
bun install --global @bunito/cli
```

The examples use the workspace dependency directly:

```bash
bunx bunito --help
```

## Project Discovery

A bunito project is any directory, or parent directory, whose `package.json`
depends on `@bunito/bunito`.

The CLI supports two layouts:

- standard apps: `src/main.ts`
- monorepos: `apps/<name>/src/main.ts`

Optional environment files are discovered automatically:

- standard apps: `.env`
- monorepo apps: `apps/<name>/.env`

## Commands

Start every discovered app:

```bash
bunito start
```

Start selected apps in a monorepo:

```bash
bunito start simple-controller
bunito start json-middleware multiple-apis
```

Useful start flags:

```bash
bunito start --watch
bunito start --prod
bunito start --label name
```

Build apps into `out/`:

```bash
bunito build
bunito build simple-controller --minify --sourcemap
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
    "cli": "bunx bunito",
    "build": "bunx bunito build",
    "start": "bunx bunito start"
  }
}
```

Run all example apps:

```bash
cd examples/http
bun run start
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
sets the port for only the `json-middleware` app.

The tutorials explain those apps step by step:

- [Basics](/tutorials/basics)
- [Simple Controller](/tutorials/simple-controller)
- [JSON Middleware](/tutorials/json-middleware)
- [Multiple APIs](/tutorials/multiple-apis)
- [Microservices](/tutorials/microservices)
- [Monorepo](/tutorials/monorepo)
