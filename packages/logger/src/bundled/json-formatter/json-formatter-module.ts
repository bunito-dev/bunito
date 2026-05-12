import { Module } from '@bunito/container';
import { JSONFormatter } from './json-formatter';

@Module({
  extensions: [JSONFormatter],
})
export class JSONFormatterModule {}
