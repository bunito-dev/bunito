import { Module } from '@bunito/container';
import { SystemService } from './system.service';

@Module({
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
