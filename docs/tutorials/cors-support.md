# CORS Support

This tutorial mirrors the `examples/http` `cors-support` app. It shows how to apply
CORS at module and controller level, how CORS options are inherited by feature
modules, and how `OnRequest` can handle a route for every HTTP method.

## App Module

The app imports the `foo` feature module and sets a top-level CORS policy:

```ts
import { Module } from '@bunito/bunito';
import { UseCORS } from '@bunito/http';
import { FooModule } from './foo';

@Module({
  imports: [FooModule],
})
@UseCORS({
  origin: '*',
  credentials: true,
})
class AppModule {}
```

`UseCORS` can be placed on modules and controllers. Child modules inherit parent CORS
options unless they override them.

For browser clients, use an explicit `origin` when `credentials` is enabled.

The app entrypoint imports this module together with the shared `ExampleModule`,
which supplies the common HTTP/logger/config setup and root response:

```ts
import { App } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { AppModule } from './app.module';

await App.start({
  imports: [ExampleModule.forRoot('cors-support'), AppModule],
});
```

## Feature Module

The `foo` feature module adds a route prefix and overrides part of the inherited CORS
configuration:

```ts
import { Module, UsePrefix } from '@bunito/bunito';
import { UseCORS } from '@bunito/http';
import { BarModule } from './bar';
import { FooController } from './foo.controller';

@Module({
  imports: [BarModule],
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
`GET` and exposes one normal route:

```ts
import { Controller, Logger, optional } from '@bunito/bunito';
import { Get, UseCORS } from '@bunito/http';

@Controller({
  injects: [optional(Logger)],
})
@UseCORS({
  methods: ['GET'],
})
class FooController {
  constructor(private readonly logger: Logger | null) {}

  @Get()
  getFoo(): Response {
    this.logger?.debug('getFoo() called');

    return Response.json({
      foo: 'Hello foo!',
    });
  }
}
```

## Nested Any-Method Route

The `bar` feature is nested under `foo` and uses `OnRequest` to handle every
non-`OPTIONS` method on `/foo/bar`:

```ts
import { Controller, Logger, Module, optional, UsePrefix } from '@bunito/bunito';
import { Method, OnRequest, UseCORS } from '@bunito/http';

@Controller({
  injects: [optional(Logger)],
})
@UseCORS({
  methods: ['GET', 'POST'],
})
class BarController {
  constructor(private readonly logger: Logger | null) {}

  @OnRequest('/', {
    injects: [Method],
  })
  getBar(method: Method): Response {
    this.logger?.debug('getBar() called');

    return Response.json({
      bar: 'Hello bar!',
      method,
    });
  }
}

@Module({
  controllers: [BarController],
})
@UsePrefix('bar')
@UseCORS({
  credentials: true,
})
class BarModule {}
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

Request examples are available in
`examples/http/apps/cors-support/requests.http`.

Continue with [Microservices](./microservices.md) when you want to combine HTTP
routes with broker messaging.
