# `@bunito/cli`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

Command-line tools for initializing, generating, running, and building bunito
projects.

It provides the `bunito` binary. The CLI discovers the root app from `src/main.ts`,
workspace apps from `apps/*/src/main.ts`, and libraries from
`libs/*/src/index.ts`; no project config file is required.

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
bunito start api worker
bunito start api --root
bunito build
bunito build api worker
bunito build api --root
bunito generate app worker
bunito generate lib shared
bunito sync
```

`start` and `build` target every discovered app by default. Pass app names to
target selected workspace apps, and add `--root` when the root app should be
included with that selection. The CLI loads root and app-local `.env` files,
including environment-specific variants such as `.env.production` and
`.env.local`, before starting each app.

Generated apps and libraries use role-postfixed file names such as
`app.module.ts`, `worker.module.ts`, `shared.module.ts`, and
`shared.service.ts`.

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fcli
[npm-url]: https://www.npmjs.com/package/@bunito/cli
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
