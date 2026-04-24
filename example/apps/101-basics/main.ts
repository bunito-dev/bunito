import {
  App,
  Logger,
  LoggerModule,
  OnBoot,
  OnDestroy,
  OnInit,
  Provider,
} from '@bunito/bunito';

// Providers are regular classes registered in the application container.
@Provider({
  injects: [Logger],
})
class BarService {
  constructor(private readonly logger: Logger) {
    logger.setContext(BarService);

    this.logger.debug('created');
  }

  // Lifecycle hooks are called by the app/container at well-defined moments.
  @OnInit()
  onInit(): void {
    this.logger.debug('onInit() called');
  }

  @OnBoot()
  onBoot(): void {
    this.logger.debug('onBoot() called');
  }

  @OnDestroy()
  onDestroy(): void {
    this.logger.debug('onDestroy() called');
  }

  bar(): string {
    this.logger.debug('bar() called');

    return 'bar';
  }
}

@Provider({
  injects: [Logger, BarService],
})
class FooService {
  constructor(
    private readonly logger: Logger,
    private readonly barService: BarService,
  ) {
    logger.setContext(FooService);

    this.logger.debug('created');
  }

  @OnInit()
  onInit(): void {
    this.logger.debug('onInit() called');
  }

  @OnBoot()
  onBoot(): void {
    this.logger.debug('onBoot() called');
  }

  @OnDestroy()
  onDestroy(): void {
    this.logger.debug('onDestroy() called');
  }

  foo(): string {
    this.logger.debug('foo() called');

    return 'foo';
  }

  fooBar(): string {
    return `${this.foo()} → ${this.barService.bar()}`;
  }
}

// A module-like options object can be passed directly to App.create().
const app = await App.create({
  imports: [LoggerModule],
  providers: [FooService, BarService],
});

// Providers can also be resolved manually when an app needs direct access.
const bar = await app.resolve(BarService);
const foo = await app.resolve(FooService);

bar.bar();
foo.foo();
foo.fooBar();

// Starting triggers boot hooks; shutdown disposes providers with destroy hooks.
await app.start();
await app.shutdown();
