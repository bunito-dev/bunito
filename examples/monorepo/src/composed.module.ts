import { FirstModule } from '@apps/first';
import { SecondModule } from '@apps/second';
import { LoggerModule, Module } from '@bunito/bunito';

@Module({
  imports: [
    LoggerModule,
    // Apps can also be composed as modules when a workspace needs one combined entrypoint.
    FirstModule,
    SecondModule,
  ],
})
export class ComposedModule {}
