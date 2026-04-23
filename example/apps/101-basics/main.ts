import {
  App,
  Logger,
  LoggerModule,
  OnBoot,
  OnDestroy,
  OnInit,
  Provider,
} from '@bunito/bunito';

@Provider({
  injects: [Logger],
})
class BarService {
  constructor(private readonly logger: Logger) {
    logger.setContext(BarService);

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

const app = await App.create({
  imports: [LoggerModule],
  providers: [FooService, BarService],
});

const bar = await app.resolve(BarService);
const foo = await app.resolve(FooService);

bar.bar();
foo.foo();
foo.fooBar();

await app.start();
await app.shutdown();
