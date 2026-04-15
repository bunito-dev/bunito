import type { ModuleOptions } from '@bunito/core';
import { App, Logger, LoggerModule, Provider } from '@bunito/core';

@Provider()
class BarService {
  bar(): string[] {
    return ['bar'];
  }
}

@Provider({
  injects: [BarService],
})
class FooService {
  constructor(private readonly barService: BarService) {}

  foo(): string[] {
    return ['foo'];
  }

  bar(): string[] {
    return this.foo().concat(this.barService.bar());
  }
}

const AppModule: ModuleOptions = {
  imports: [LoggerModule],
  providers: [FooService, BarService],
};

const app = await App.create(AppModule);

const logger = await app.resolve(Logger);
const foo = await app.resolve(FooService);
const bar = await app.resolve(BarService);

logger.debug('FooService#foo', foo.foo());
logger.debug('FooService#bar', foo.bar());
logger.debug('barService#bar', bar.bar());

await app.start();
await app.shutdown();
