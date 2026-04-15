import { Module } from '@bunito/core';
import { UsePath } from '@bunito/http';
import { BarModule } from './bar';
import { FooController } from './foo.controller';
import { FooService } from './foo.service';

@Module({
  imports: [BarModule],
  controllers: [FooController],
  providers: [FooService],
})
@UsePath('/foo')
export class FooModule {}
