# `@bunito/cli`

Command-line tools for creating, running, and building bunito projects.

It provides the `bunito` binary. The CLI discovers standard projects from
`src/main.ts` and monorepo apps from `apps/*/src/main.ts`; no project config file is
required.

## Installation

```bash
bun install --global @bunito/cli
```

## Usage

```bash
bunito --help
bunito init my-app
bunito start
bunito build
bunito generate app worker
```

## License

MIT
