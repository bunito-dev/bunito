# CORS Support

This tutorial mirrors the `examples/http` `cors-support` app. It shows how to apply
CORS at module and controller level, how CORS options are inherited by feature
modules, and how `OnRequest` can handle a route for every HTTP method.

## App Module

The app imports `HTTPModule`, applies JSON serialization to all app routes, and sets
a top-level CORS policy:

```ts
import { LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule, JSONSerializer, UseCORS, UseMiddleware } from '@bunito/http';
import { AppController } from './app-controller';
import { FooModule } from './foo';

@Module({
  imports: [LoggerModule, HTTPModule, FooModule],
  controllers: [AppController],
})
@UseMiddleware(JSONSerializer)
@UseCORS({
  origin: '*',
  credentials: true,
})
class AppModule {}
```

`UseCORS` can be placed on modules and controllers. Child modules inherit parent CORS
options unless they override them.

For browser clients, use an explicit `origin` when `credentials` is enabled.

## Root Controller

The root controller uses the normal `@Controller()` and route decorators:

```ts
import { Controller } from '@bunito/bunito';
import { Get } from '@bunito/http';

@Controller()
class AppController {
  @Get()
  index(): Response {
    return Response.json({
      example: 'cors-support',
    });
  }
}
```

Requests to `/` receive the app-level CORS headers.

## Feature Module

The `foo` feature module adds a route prefix and overrides part of the inherited CORS
configuration:

```ts
import { Module, UsePrefix } from '@bunito/bunito';
import { UseCORS } from '@bunito/http';
import { FooController } from './foo-controller';

@Module({
  controllers: [FooController],
})
@UsePrefix('foo')
@UseCORS({
  maxAge: 3600,
  credentials: false,
})
class FooModule {}
```

`UsePrefix('foo')` is normalized by the router, so the controller routes are mounted
under `/foo`.

## Controller-Level CORS

Controllers can refine the policy further. This controller limits CORS methods to
`GET` and exposes one normal route plus one catch-all-method route:

```ts
import { Controller, Logger } from '@bunito/bunito';
import { Get, Method, OnRequest, UseCORS } from '@bunito/http';

@Controller({
  injects: [Logger],
})
@UseCORS({
  methods: ['GET'],
})
class FooController {
  constructor(private readonly logger: Logger) {
    logger.setContext(FooController);
  }

  @Get()
  getFoo(): Response {
    this.logger.debug('getFoo() called');

    return Response.json({
      foo: 'Hello foo!',
    });
  }

  @OnRequest('/bar', {
    injects: [Method],
  })
  getBar(method: Method): Response {
    this.logger.debug('getBar() called');

    return Response.json({
      bar: 'Hello bar!',
      method,
    });
  }
}
```

`OnRequest` registers a handler for any non-`OPTIONS` method. The router still
responds to `OPTIONS` automatically for preflight requests on discovered routes.

## Run The Example

In the repository examples, this app lives at
`examples/http/apps/cors-support/src/main.ts`. Its port is defined in
`examples/http/apps/cors-support/.env`.

Run it:

```bash
cd examples/http
bun run start cors-support
```

Try a preflight request:

```bash
curl -i -X OPTIONS http://localhost:4004/foo/bar
```

Then try a regular request:

```bash
curl -i http://localhost:4004/foo
```

Continue with [Microservices](/tutorials/microservices) when you want to combine HTTP
routes with broker messaging.
