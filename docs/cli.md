# CLI

The `bunito` CLI is intended to be the main way developers run bunito applications.
It reads a project-level `bunito.json` file and starts one or more configured apps.

Install it globally:

```bash
bun install --global @bunito/cli
```

> The CLI is still under active development. The examples already use it, but some
> commands and project creation flows are expected to evolve. If you want a stable
> reference today, follow the [tutorials](/tutorials/basics), which are based on the
> repository example workspace.

## `bunito.json`

A bunito project declares runnable apps in `bunito.json`:

```json
{
  "apps": {
    "api": {
      "entry": "src/main.ts",
      "envs": {
        "PORT": 4201
      }
    }
  }
}
```

Each app has:

- `entry`: the TypeScript file to run
- `envs`: optional environment values passed to the app

## Package Scripts

The examples expose CLI commands through `package.json`:

```json
{
  "scripts": {
    "start:all": "bunito start",
    "start:api": "bunito start api"
  }
}
```

Run one app:

```bash
bun run start:api
```

Run all apps from `bunito.json`:

```bash
bun run start:all
```

## Example Workspace

The repository example workspace uses this setup:

```json
{
  "apps": {
    "101-basics": {
      "entry": "apps/101-basics/main.ts"
    },
    "201-simple-controller": {
      "entry": "apps/201-simple-controller/main.ts",
      "envs": {
        "PORT": 4201
      }
    }
  }
}
```

The tutorials explain those apps step by step:

- [Basics](/tutorials/basics)
- [Simple Controller](/tutorials/simple-controller)
- [JSON Middleware](/tutorials/json-middleware)
- [Multiple APIs](/tutorials/multiple-apis)
