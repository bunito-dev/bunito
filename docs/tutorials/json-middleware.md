# JSON Middleware

This tutorial mirrors the `examples/http` `json-middleware` app. It adds JSON
request body handling, raw body injection, parsed body injection, and body
validation.

## Import JSON Tools

```ts
import {
  Body,
  Controller,
  Get,
  HTTPModule,
  JSONMiddleware,
  JSONModule,
  Params,
  Post,
  UseMiddleware,
} from '@bunito/http';
```

`JSONModule` registers JSON support. `JSONMiddleware` applies it to routes.

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
import { Logger } from '@bunito/bunito';

@Controller('/foo', {
  injects: [Logger],
})
@UseMiddleware(JSONMiddleware)
class FooController {
  constructor(private readonly logger: Logger) {}

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

## Register JSONModule

```ts
import { App, LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule, JSONModule } from '@bunito/http';

@Module({
  imports: [LoggerModule, HTTPModule, JSONModule],
  controllers: [FooController],
})
class AppModule {}

await App.start(AppModule);
```

In the repository examples, this app lives at
`examples/http/apps/json-middleware/src/main.ts`. Its port is defined in
`examples/http/apps/json-middleware/.env`.

Run it:

```bash
cd examples/http
bun run start json-middleware
```

Request examples are available in `examples/http/apps/json-middleware.http`.

Continue with [Multiple APIs](/tutorials/multiple-apis).
