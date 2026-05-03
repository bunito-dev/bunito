import { App, LoggerModule, Module } from '@bunito/bunito';
import { Controller, Get, HttpModule, Post, UsePath } from '@bunito/http';

@Controller('/ctr')
class FooController {
  @Get('/')
  getIndex() {
    return 'getIndex';
  }

  @Post('/')
  postIndex() {
    return 'postIndex';
  }
}

@Module({
  controllers: [FooController],
})
@UsePath('/foo')
class FooModule {}

const app = await App.create({
  imports: [LoggerModule, FooModule, HttpModule],
});

await app.start();
