import { Module } from '@bunito/core';
import { UsePath } from '@bunito/http';
import { BarModule } from './bar';
import { FooController } from './foo.controller';
import { FooService } from './foo.service';

// FooModule shows how a feature can import another feature module and add its own prefix.
@Module({
  imports: [BarModule],
  controllers: [FooController],
  providers: [FooService],
})
@UsePath('/foo') // `/foo` is the default prefix for all controllers and modules
export class FooModule {}
