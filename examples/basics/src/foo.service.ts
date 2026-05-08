import {
  Logger,
  OnAppShutdown,
  OnAppStart,
  OnDestroy,
  OnInit,
  Provider,
} from '@bunito/bunito';
import { BarService } from './bar.service';

@Provider({
  injects: {
    logger: Logger,
    barService: BarService,
  },
})
export class FooService {
  private readonly logger: Logger;
  private readonly barService: BarService;

  constructor(options: {
    logger: Logger;
    barService: BarService;
  }) {
    // Object injects keep constructor arguments named when a provider has several dependencies.
    const { logger, barService } = options;
    logger.setContext(FooService);

    this.logger = logger;
    this.logger.debug('created');

    this.barService = barService;
  }

  @OnInit()
  onInit(): void {
    this.logger.debug('onInit() called');
  }

  @OnDestroy()
  onDestroy(): void {
    this.logger.debug('onDestroy() called');
  }

  @OnAppStart()
  onAppStart(): void {
    this.logger.debug('onAppStart() called');
  }

  @OnAppShutdown()
  onAppShutdown(): void {
    this.logger.debug('onAppShutdown() called');
  }

  foo(): string {
    this.logger.debug('foo() called');

    return 'foo';
  }

  fooBar(): string {
    // Providers can call other providers after the container resolves dependencies.
    return `${this.foo()} → ${this.barService.bar()}`;
  }
}
