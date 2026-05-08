# Multiple APIs

This tutorial mirrors the `http-multiple-apis` example. It shows how to split an
app into feature modules with their own prefixes and middleware.

## Create A Feature Module

```ts
import { Logger, Module } from '@bunito/bunito';
import { Controller, Get, Params, UsePrefix } from '@bunito/http';
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
  JSONMiddleware,
  JSONModule,
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
  imports: [JSONModule],
  controllers: [BarController],
})
@UsePrefix('/bar')
@UseMiddleware(JSONMiddleware)
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

In the repository example workspace, this app lives at
`apps/http-multiple-apis/src/main.ts`. Its port is defined in
`apps/http-multiple-apis/.env`.

Run it:

```bash
cd example
bun run start http-multiple-apis
```

You now have two route groups:

- `/foo/*`: simple text responses
- `/bar/*`: JSON responses with module-level middleware
