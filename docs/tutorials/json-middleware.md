# JSON Middleware

This tutorial mirrors the `202-json-middleware` example. It adds JSON request body
handling, raw body injection, parsed body injection, and body validation.

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

Add the app to `bunito.json`:

```json
{
  "apps": {
    "202-json-middleware": {
      "entry": "apps/202-json-middleware/main.ts",
      "envs": {
        "PORT": "4202"
      }
    }
  }
}
```

Run it:

```bash
bunito start 202-json-middleware
```

Continue with [Multiple APIs](/tutorials/multiple-apis).
