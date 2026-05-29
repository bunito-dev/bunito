import { Module } from '@bunito/container';
import { IOModule } from '../io';
import { ProjectService } from './project.service';

@Module({
  imports: [IOModule],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
