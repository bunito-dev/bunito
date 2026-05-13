---
title: Documentation
---

# Getting Started

`bunito` is a small Bun-first TypeScript framework for applications built from
modules, providers, lifecycle hooks, configuration, logging, and HTTP controllers.

The framework is intentionally split into focused packages. Start with
`@bunito/bunito` for application code, then add feature packages such as
`@bunito/http` when the application needs them.

## Install The CLI

The preferred entrypoint for bunito projects is the CLI.

```bash
bun install --global @bunito/cli
```

The CLI is also used by the repository examples in `examples/*`.

## Manual Setup

Create a Bun project:

```bash
mkdir my-bunito-app
cd my-bunito-app
bun init -y
```

Install the core package:

```bash
bun add @bunito/bunito
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

- Read the project model in [Overview](/overview).
- Learn how the CLI discovers projects in [CLI](/cli).
- Build the first example in [Basics](/tutorials/basics).
- Add HTTP controllers in [HTTP](/techniques/http).
- Explore composed apps in [Monorepo](/tutorials/monorepo).
