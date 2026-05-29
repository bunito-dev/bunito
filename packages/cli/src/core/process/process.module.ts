import process from 'node:process';
import { Module } from '@bunito/container';
import { hideBin } from 'yargs/helpers';
import { PROCESS_ARGV_ID, PROCESS_CWD_ID } from './constants';
import { ProcessService } from './process.service';

@Module({
  providers: [
    ProcessService,
    {
      token: PROCESS_CWD_ID,
      useValue: process.cwd(),
    },
    {
      token: PROCESS_ARGV_ID,
      useValue: hideBin([...process.argv]),
    },
  ],
  exports: [ProcessService],
})
export class ProcessModule {}
