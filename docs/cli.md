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
bunito start http-simple-controller
bunito start http-json-middleware http-multiple-apis
```

Useful start flags:

```bash
bunito start --watch
bunito start --prod
bunito start --pad
```

Build apps into `out/`:

```bash
bunito build
bunito build http-simple-controller --minify --sourcemap
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
bunito --cwd example start http-simple-controller
```

## Package Scripts

The example workspace keeps scripts small:

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
cd example
bun run start
```

Run one example app:

```bash
cd example
bun run start http-json-middleware
```

Build the examples:

```bash
cd example
bun run build
```

## Example Workspace

The repository example workspace is a monorepo:

```text
example/
  apps/
    basics/
      src/main.ts
    http-json-middleware/
      .env
      src/main.ts
    http-multiple-apis/
      .env
      src/main.ts
    http-simple-controller/
      .env
      src/main.ts
```

The tutorials explain those apps step by step:

- [Basics](/tutorials/basics)
- [Simple Controller](/tutorials/simple-controller)
- [JSON Middleware](/tutorials/json-middleware)
- [Multiple APIs](/tutorials/multiple-apis)
