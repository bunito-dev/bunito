import { Logger, Module, OnAppStart, optional } from '@bunito/bunito';
import { BarService } from './bar.service';
import { FooService } from './foo.service';

@Module({
  providers: [FooService, BarService],
  exports: [FooService, BarService],
  injects: [optional(Logger)],
})
export class MainModule {
  constructor(private readonly logger: Logger | null) {}

  @OnAppStart()
  onStart(): void {
    this.logger?.debug('onStart() called');
  }
}
