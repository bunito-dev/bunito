# `@bunito/cli`

Command-line tools for creating, running, and building bunito projects.

It provides the `bunito` binary. The CLI discovers standard projects from
`src/main.ts` and monorepo apps from `apps/*/src/main.ts`; no project config file is
required.

## Installation 📦

Run the CLI without installing it globally:

```bash
bunx @bunito/cli --help
```

Or install it globally if you want the `bunito` binary available everywhere:

```bash
bun install --global @bunito/cli
```

## Usage 🚀

```bash
bunito --help
bunito init my-app
bunito init my-workspace --app api --app worker
bunito start
bunito build
bunito generate app worker
bunito generate lib shared
```

The CLI loads `.env` for standard apps and `apps/<name>/.env` for monorepo apps.

## License

MIT
