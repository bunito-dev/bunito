import { Module } from '../container';
import { CommandService } from './command.service';

@Module({
  providers: [CommandService],
  exports: [CommandService],
})
export class CommandModule {
  //
}
