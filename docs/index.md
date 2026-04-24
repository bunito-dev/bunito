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

> The CLI is still under active development. It is already used by the example
> workspace, but project scaffolding and day-to-day workflows may change. For the
> most reliable starting point today, continue with the manual setup below and the
> step-by-step [tutorials](/tutorials/basics).

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

Create `src/main.ts`:

```ts
import { App, Logger, LoggerModule, Provider } from '@bunito/bunito';

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

const app = await App.create({
  imports: [LoggerModule],
  providers: [HelloService],
});

const helloService = await app.resolve(HelloService);

console.log(helloService.hello());

await app.start();
await app.shutdown();
```

Add a `bunito.json` file. The CLI reads this file to discover runnable apps:

```json
{
  "apps": {
    "main": {
      "entry": "src/main.ts"
    }
  }
}
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "start": "bunito start main"
  }
}
```

Run the app:

```bash
bun run start
```

## Next Steps

- Read the project model in [Overview](/overview).
- Learn how the CLI reads `bunito.json` in [CLI](/cli).
- Build the first example in [Basics](/tutorials/basics).
- Add HTTP controllers in [HTTP](/techniques/http).
