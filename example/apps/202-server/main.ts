import { App, LoggerModule, Module } from '@bunito/bunito';
import {
  Controller,
  Get,
  HttpModule,
  Middleware,
  Params,
  Query,
  UsePrefix,
} from '@bunito/http';
import type { HttpException, RequestContext } from '@bunito/server';
import { z } from 'zod';

@Middleware()
class FooMiddleware implements Middleware {
  beforeRequest(context: RequestContext) {
    context.state.foo = 'bar';
  }

  serializeResponseData(data: unknown, context: RequestContext) {
    return Response.json({
      data,
    });
  }

  serializeException(exception: HttpException, context: RequestContext) {
    return exception.toResponse('application/json');
  }
}

@Controller('/a', {
  middleware: [FooMiddleware],
})
class FooController {
  @Get('/x1/:xxx1/:xxx2', {
    injects: [
      Params(
        z.object({
          xxx1: z.string(),
          xxx2: z.string(),
          xxx3: z.string().default('aaa'),
        }),
      ),
      Query,
      Request,
      Headers,
      URL,
    ],
  })
  async index1(
    params: Params<{ xxx1: string; xxx2: string }>,
    query: Query,
    request: Request,
    headers: Headers,
    url: URL,
  ) {
    return {
      params,
      query,
      request,
      headers,
      url,
    };
  }

  @Get('/x2', {
    uses: [FooMiddleware],
  })
  index2() {
    return Response.json({
      a: 1,
    });
  }
}

@Module({
  imports: [HttpModule],
  controllers: [FooController],
})
@UsePrefix('/foo')
class FooModule {}

@Controller()
class BarController {
  @Get('/b')
  index() {
    return Response.json({
      bar: 'a',
    });
  }
}

@Module({
  imports: [HttpModule],
  controllers: [BarController],
  middleware: [FooMiddleware],
})
@UsePrefix('/bar')
class BarModule {}

await App.start({
  imports: [LoggerModule, FooModule, BarModule],
});
