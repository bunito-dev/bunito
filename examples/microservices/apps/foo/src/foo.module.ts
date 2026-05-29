import { Module } from '@bunito/bunito';
import { ClientModule } from '@libs/client';
import { FooController } from './foo.controller';

@Module({
  imports: [ClientModule],
  controllers: [FooController],
})
export class FooModule {}
