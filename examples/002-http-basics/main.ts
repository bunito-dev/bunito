import { App, Controller, LoggerModule, Module, Provider } from '@bunito/core';
import { Get, HttpModule, OnResponse, UsesPath } from '@bunito/http';

@Provider()
class BarService {
  bar(): string {
    return 'bar';
  }
}

@Controller()
@UsesPath('/foo')
class FooController {
  constructor(private readonly fooService: BarService) {
    //
  }

  @Get('/bar')
  bar(): string {
    return this.fooService.bar();
  }
}

@Module({
  controllers: [FooController],
  providers: [BarService],
})
@UsesPath('/v1')
class FooModule {
  @OnResponse({
    path: '/**',
  })
  onResponse(response: Response): Response {
    response.headers.set('X-Version', '1.0.0');
    return response;
  }
}

const app = await App.create('example', {
  imports: [LoggerModule, HttpModule, FooModule],
});

await app.boot();
