---
title: Documentation
---

# Getting Started

`bunito` is a small Bun-first TypeScript framework for applications built from
modules, providers, lifecycle hooks, configuration, logging, HTTP controllers, and
broker-based messaging.

The framework is intentionally split into focused packages. Start with
`@bunito/bunito` for application code, then add feature packages such as
`@bunito/http` or `@bunito/broker` when the application needs them.

The fastest way to learn the API is to run one of the repository examples, then
read the matching tutorial. The snippets below show the same standard project
shape the CLI expects.

## Run the CLI

The preferred entrypoint for bunito projects is the CLI. It can create projects,
start discovered apps, build them, and generate app/library files.

Run it without installing it globally:

```bash
bunx @bunito/cli --help
```

Or install it globally if you want the `bunito` binary available everywhere:

```bash
bun install --global @bunito/cli
```

The CLI is also used by the repository examples in `examples/*`.

## Manual Setup

Create a Bun project:

```bash
mkdir my-app
cd my-app
bun init -y
```

Install the core package and the CLI:

```bash
bun add @bunito/bunito
bun add -d @bunito/cli
```

Configure TypeScript by extending the bunito config:

```json
{
  "extends": "@bunito/bunito/tsconfig.json"
}
```

Create `src/app-module.ts`:

```ts
import { Logger, LoggerModule, Module, Provider } from '@bunito/bunito';

@Provider({
  injects: [Logger],
})
class HelloService {
  constructor(private readonly logger: Logger) {
    this.logger.setContext(HelloService);
  }

  hello(): string {
    this.logger.debug('hello() called');

    return 'Hello from bunito';
  }
}

@Module({
  imports: [LoggerModule],
  providers: [HelloService],
})
export class AppModule {}
```

Create `src/main.ts`:

```ts
import { App } from '@bunito/bunito';
import { AppModule } from './app-module';

await App.start(AppModule);
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "build": "bunito build",
    "start": "bunito start"
  }
}
```

The CLI discovers `src/main.ts` automatically in standard projects.
If you add a `.env` file next to `package.json`, the CLI loads it before starting
the app.

Run the app:

```bash
bun run start
```

## Next Steps

- Read the project model in [Overview](./overview.md).
- Learn how the CLI discovers projects in [CLI](./cli.md).
- Build the first example in [Basics](./tutorials/basics.md).
- Add HTTP controllers in [HTTP](./techniques/http.md).
- Explore composed apps in [Monorepo](./tutorials/monorepo.md).
