import {
  Logger,
  OnAppShutdown,
  OnAppStart,
  OnDestroy,
  OnInit,
  optional,
  Provider,
} from '@bunito/bunito';

@Provider({
  injects: [optional(Logger)],
})
export class BarService {
  constructor(private readonly logger: Logger | null) {
    this.logger?.debug('created');
  }

  // Lifecycle hooks are called by the app/container at well-defined moments.
  @OnInit()
  onInit(): void {
    this.logger?.debug('onInit() called');
  }

  @OnDestroy()
  onDestroy(): void {
    this.logger?.debug('onDestroy() called');
  }

  @OnAppStart()
  onAppStart(): void {
    this.logger?.debug('onAppStart() called');
  }

  @OnAppShutdown()
  onAppShutdown(): void {
    this.logger?.debug('onAppShutdown() called');
  }

  bar(): string {
    this.logger?.debug('bar() called');

    return 'bar';
  }
}
