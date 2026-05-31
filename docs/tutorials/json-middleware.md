# JSON Middleware

This tutorial mirrors the `examples/http` `json-middleware` app. It adds JSON
request body handling, raw body injection, parsed body injection, and body
validation.

## Import JSON Tools

```ts
import { Controller } from '@bunito/bunito';
import {
  Body,
  BodyParser,
  Get,
  HTTPModule,
  JSONSerializer,
  Params,
  Post,
  UseMiddleware,
} from '@bunito/http';
```

`HTTPModule` registers the bundled body parser and JSON serializer providers.
`UseMiddleware` applies one middleware at a time and can pass options to that
middleware.

## Define Schemas

```ts
import { z } from 'zod';

const FooParams = z.object({
  bar: z.string().max(2),
});

const FooBody = z.object({
  foo: z.string().default("I'm a foo"),
  bar: z.string().default("I'm a bar"),
});
```

Params and body validation are independent.

## Apply JSON Middleware

```ts
import type { RawObject } from '@bunito/bunito';
import { Controller, Logger, optional } from '@bunito/bunito';
import {
  Body,
  BodyParser,
  Get,
  JSONSerializer,
  Params,
  Post,
  UseMiddleware,
} from '@bunito/http';

@Controller('/foo', {
  injects: [optional(Logger)],
})
@UseMiddleware(JSONSerializer)
@UseMiddleware(BodyParser, { parser: 'json' })
class FooController {
  constructor(private readonly logger: Logger | null) {}

  @Get('/:bar', {
    injects: [Params(FooParams)],
  })
  getFoo(params: Params<typeof FooParams>): RawObject {
    return {
      params,
    };
  }

  @Post('/:bar', {
    injects: [Params(FooParams), Body(), Body(FooBody)],
  })
  postFoo(
    params: Params<typeof FooParams>,
    rawBody: unknown,
    body: Body<typeof FooBody>,
  ): RawObject {
    return {
      params,
      rawBody,
      body,
    };
  }
}
```

`Body()` injects the parsed body. `Body(FooBody)` injects the parsed and validated
body.

## Register The App

```ts
import { Module } from '@bunito/bunito';

@Module({
  imports: [FooModule],
})
class AppModule {}
```

The repository example gets `HTTPModule`, `LoggerModule`, and `ConfigModule` from
the shared `ExampleModule` in `examples/http/libs/example`:

```ts
import { App } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { AppModule } from './app.module';

await App.start({
  imports: [ExampleModule.forRoot('json-middleware'), AppModule],
});
```

In the repository examples, this app lives at
`examples/http/apps/json-middleware/src/main.ts`. Its port is defined in
`examples/http/apps/json-middleware/.env`.

Run it:

```bash
cd examples/http
bun run start json-middleware
```

Request examples are available in
`examples/http/apps/json-middleware/requests.http`.

Continue with [Multiple APIs](./multiple-apis.md).
