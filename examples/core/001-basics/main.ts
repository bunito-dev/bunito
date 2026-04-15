import { App, Logger, LoggerModule, Provider } from '@bunito/core';

// A plain provider can be resolved from the container without additional setup.
@Provider()
class BarService {
  bar(): string[] {
    return ['bar'];
  }
}

// Dependencies are declared explicitly, so the container can resolve them at runtime.
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

// App.create() builds the container first, so we can resolve providers before booting.
const app = await App.create({
  // In this example we build the module inline to show the smallest possible app setup.
  imports: [LoggerModule],
  providers: [FooService, BarService],
});

const logger = await app.resolve(Logger);
const foo = await app.resolve(FooService);
const bar = await app.resolve(BarService);

// Resolving providers before start is handy for CLIs, scripts, and one-off jobs.
logger.debug('FooService#foo', foo.foo());
logger.debug('FooService#bar', foo.bar());
logger.debug('BarService#bar', bar.bar());

// start()/shutdown() still run the regular lifecycle hooks even in a tiny script example.
await app.start();
await app.shutdown();
