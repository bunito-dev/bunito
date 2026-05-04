import { App, LoggerModule, Module } from '@bunito/bunito';
import type { MiddlewareContext } from '@bunito/http';
import {
  Controller,
  Get,
  HTTPModule,
  JSONMiddleware,
  JSONModule,
  Middleware,
  Params,
  Post,
  Query,
  UseMiddleware,
  UsePath,
} from '@bunito/http';
import { z } from 'zod';

@Middleware()
class FooMiddleware
  implements
    Middleware<{
      a: boolean;
      b: number;
    }>
{
  beforeRequest(
    _ctx: MiddlewareContext<{
      a: boolean;
      b: number;
    }>,
  ): undefined {}
}

const GetParams = z.object({ a: z.string(), b: z.string(), c: z.string().default('c') });

@Controller('/ctr')
@UseMiddleware(FooMiddleware, { a: true, b: 123 })
class FooController {
  @Get('/:a/:b', {
    injects: [Params(GetParams), Query],
  })
  getIndex(params: Params<typeof GetParams>, query: Query) {
    return { foo: 'bar', params, query };
  }

  @Post('/')
  postIndex() {
    return 'postIndex';
  }
}

@Module({
  controllers: [FooController],
  extensions: [FooMiddleware],
})
@UsePath('/foo')
@UseMiddleware(JSONMiddleware, { replaceBody: true })
class FooModule {}

const app = await App.create({
  imports: [LoggerModule, FooModule, HTTPModule, JSONModule],
});

await app.start();
