import { Module } from '@bunito/container';
import { SystemModule } from '../system';
import { ProjectService } from './project.service';

@Module({
  imports: [SystemModule],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
