import { App, Controller, Logger, LoggerModule, Module, Provider } from '@bunito/core';
import type { OnRequestContext, OnRequestSchema } from '@bunito/http';
import {
  HttpModule,
  OnGet,
  OnRequest,
  OnResponse,
  RoutingModule,
  RoutingService,
  UsesPath,
} from '@bunito/http';
import { z } from 'zod';

@Provider()
class BarService {
  bar(): string {
    return 'bar';
  }
}

@Controller({
  injects: [BarService],
})
@UsesPath('/foo')
class BarController {
  constructor(private readonly barService: BarService) {
    //
  }

  @OnGet('/bar')
  bar(): string {
    return this.barService.bar();
  }
}

type OnResponseArgs = [request: Request];

const FooBar2Schema = {
  query: z.object({ a: z.number() }),
  params: z.object({
    a: z.string(),
    b: z.string(),
  }),
} satisfies OnRequestSchema;

@Controller()
class FooController {
  @OnRequest() onRequest() {
    return {
      version: '1.0.0',
    };
  }

  @OnResponse()
  onResponse(...[request]: OnResponseArgs): Response {
    return Response.json({
      request,
    });
  }

  @OnGet('/bar')
  bar(): string {
    return 'bar';
  }

  @OnGet('/**')
  bar1() {
    return {
      a: 'bla',
    };
  }

  @OnGet('/bar/:a/:b', FooBar2Schema)
  bar2(context: OnRequestContext<typeof FooBar2Schema, { a: number }>): string {
    console.log(context.params);
    console.log(context.data);
    console.log(context.query);
    console.log(context.body);

    return 'bar2';
  }
}

@Module({
  controllers: [FooController, BarController],
  providers: [BarService],
})
@UsesPath('/v1')
class FooModule {}

const app = await App.create('example', {
  imports: [LoggerModule, HttpModule, FooModule, RoutingModule],
});

const router = await app.resolve(RoutingService);
const logger = await app.resolve(Logger);

logger.debug(router.inspectRoutes());

await app.boot();
