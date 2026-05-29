import { Module } from '@bunito/container';
import { JSONLogTransform } from './json.log-transform';

@Module({
  extensions: [JSONLogTransform],
})
export class JSONLoggerModule {}
