import { App, Controller, Logger, LoggerModule, Module, Provider } from '@bunito/core';
import {
  Get,
  HttpModule,
  OnRequest,
  OnResponse,
  RoutingModule,
  RoutingService,
  UsesPath,
} from '@bunito/http';

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

  @Get('/bar')
  bar(): string {
    return this.barService.bar();
  }
}

@Controller()
class FooController {
  @OnRequest() onRequest() {
    return {
      version: '1.0.0',
    };
  }

  @OnResponse()
  onResponse(data: unknown): Response {
    return Response.json({
      data,
    });
  }

  @Get('/bar')
  bar(): string {
    return '';
  }

  @Get('/**')
  bar1() {
    return {
      a: 'bla',
    };
  }

  @Get('/bar/:a/:b')
  bar2(): string {
    return '';
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
