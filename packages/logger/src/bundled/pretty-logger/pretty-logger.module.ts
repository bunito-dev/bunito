import { Module } from '@bunito/container';
import { PrettyLogTransform } from './pretty.log-transform';
import { PrettyLoggerConfig } from './pretty-logger.config';

@Module({
  configs: [PrettyLoggerConfig],
  extensions: [PrettyLogTransform],
})
export class PrettyLoggerModule {}
