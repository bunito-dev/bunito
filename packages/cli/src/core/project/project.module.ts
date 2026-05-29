import { Module } from '@bunito/container';
import { IOModule } from '../io';
import { ProcessModule } from '../process';
import { ProjectService } from './project.service';

@Module({
  imports: [IOModule, ProcessModule],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
