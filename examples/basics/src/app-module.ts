import { Logger, Module, OnAppStart } from '@bunito/bunito';
import { BarService, FooService } from './services';

@Module({
  providers: [FooService, BarService],
  injects: [Logger],
  exports: [FooService, BarService],
})
export class AppModule {
  constructor(private readonly logger: Logger) {
    this.logger.setContext(AppModule);
  }

  @OnAppStart()
  onStart(): void {
    // App-level hooks are useful for startup work that belongs to the module.
    this.logger.debug('onStart() called');
  }
}
