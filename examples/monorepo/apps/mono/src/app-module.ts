import { FirstModule } from '@apps/first';
import { SecondModule } from '@apps/second';
import { Module } from '@bunito/bunito';

@Module({
  // Apps can also be composed as modules when a workspace needs one combined entrypoint.
  imports: [FirstModule, SecondModule],
})
export class AppModule {}
