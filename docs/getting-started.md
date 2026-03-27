# Getting Started

This guide walks through a minimal Bunito application using `@bunito/core` and
`@bunito/http`.

## Prerequisites

- [Bun](https://bun.sh) installed
- a TypeScript project using ESM

## Install Packages

```bash
bun add @bunito/core @bunito/http zod
```

## Create A Controller

```ts
import { Controller } from '@bunito/core';
import { Get, Route } from '@bunito/http';

@Route('/hello')
@Controller()
export class HelloController {
  @Get('/')
  hello() {
    return {
      message: 'Hello from Bunito',
    };
  }
}
```

## Create A Module

You can define modules either as plain `ModuleOptions` objects or as decorated
classes. A decorated module class is usually the most ergonomic starting point.

```ts
import { Module } from '@bunito/core';
import { HttpModule } from '@bunito/http';
import { HelloController } from './hello.controller';

@Module({
  imports: [HttpModule],
  controllers: [HelloController],
})
export class AppModule {}
```

## Bootstrap The Application

```ts
import { App } from '@bunito/core';
import { AppModule } from './app.module';

const app = await App.create('my-app', AppModule);

await app.bootstrap();
```

At this point, Bunito will:

1. compile the module graph
2. construct the container
3. run setup hooks
4. discover HTTP routes
5. start the HTTP server during bootstrap

## Add Validation

You can attach `zod` schemas to route handlers and get typed request context.

```ts
import { Controller } from '@bunito/core';
import type { HttpContext } from '@bunito/http';
import { Get } from '@bunito/http';
import { z } from 'zod';

const querySchema = {
  query: z.object({
    name: z.string(),
  }),
};

@Controller()
export class HelloController {
  @Get({
    path: '/',
    schema: querySchema,
  })
  hello(context: HttpContext<typeof querySchema>) {
    return {
      message: `Hello ${context.query.name}`,
    };
  }
}
```

## Add A Provider

Providers can be classes, factories, or values.

```ts
import { Controller, Module, Provider } from '@bunito/core';
import { Get } from '@bunito/http';

@Provider()
class HelloService {
  message() {
    return 'Hello from a provider';
  }
}

@Controller({
  injects: [HelloService],
})
class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @Get('/')
  hello() {
    return {
      message: this.helloService.message(),
    };
  }
}

@Module({
  imports: [HttpModule],
  providers: [HelloService],
  controllers: [HelloController],
})
export class AppModule {}
```

## Next Steps

After the minimal app is working, the best next references are:

- [`architecture.md`](./architecture.md)
- [`testing.md`](./testing.md)
- [`../packages/core/README.md`](/Users/staszek/Workspace/stanislaw-glogowski/bunito/packages/core/README.md)
- [`../packages/http/README.md`](/Users/staszek/Workspace/stanislaw-glogowski/bunito/packages/http/README.md)
- [`../example/src/main.ts`](/Users/staszek/Workspace/stanislaw-glogowski/bunito/example/src/main.ts)

## Current Limits

The framework is already usable, but some HTTP features are still planned:

- middleware
- multipart/form-data support
- richer custom HTTP error responses
