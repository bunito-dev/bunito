# Multiple APIs

This tutorial mirrors the `examples/http` `multiple-apis` app. It shows how to
split an app into feature modules with their own prefixes and middleware.

## Create A Feature Module

```ts
import { Logger, Module, UsePrefix } from '@bunito/bunito';
import { Controller, Get, Params } from '@bunito/http';
import { z } from 'zod';

const FooParams = z.object({
  foo: z.string().max(2),
});

@Controller('/', {
  injects: [Logger],
  scope: 'singleton',
})
class FooController {
  constructor(private readonly logger: Logger) {
    logger.setContext(FooController);
  }

  @Get('/:foo', {
    injects: [Params(FooParams)],
  })
  getFoo(params: Params<typeof FooParams>): Response {
    return new Response(`foo: ${params.foo}`);
  }
}

@Module({
  controllers: [FooController],
})
@UsePrefix('/foo')
class FooModule {}
```

Every route in `FooModule` is mounted under `/foo`.

## Add A JSON Module

```ts
import type { RawObject } from '@bunito/bunito';
import {
  JSONSerializer,
  NotFoundException,
  UseMiddleware,
} from '@bunito/http';

const BarParams = z.object({
  bar: z.string().max(2),
});

@Controller('/', {
  injects: [Logger],
  scope: 'singleton',
})
class BarController {
  constructor(private readonly logger: Logger) {
    logger.setContext(BarController);
  }

  @Get('/:bar', {
    injects: [Params(BarParams)],
  })
  getBar(params: Params<typeof BarParams>): RawObject {
    return {
      action: 'getBar',
      params,
    };
  }

  @Get()
  @Get('/*')
  notFound(): never {
    throw new NotFoundException();
  }
}

@Module({
  controllers: [BarController],
})
@UsePrefix('/bar')
@UseMiddleware(JSONSerializer)
class BarModule {}
```

`BarModule` applies both a prefix and JSON middleware to its controllers.

## Compose The App

```ts
import { App, LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';

@Module({
  imports: [LoggerModule, HTTPModule, FooModule, BarModule],
})
class AppModule {}

await App.start(AppModule);
```

In the repository examples, this app lives at
`examples/http/apps/multiple-apis/src/main.ts`. Its port is defined in
`examples/http/apps/multiple-apis/.env`.

Run it:

```bash
cd examples/http
bun run start multiple-apis
```

Request examples are available in `examples/http/apps/multiple-apis.http`.

You now have two route groups:

- `/foo/*`: simple text responses
- `/bar/*`: JSON responses with module-level middleware
