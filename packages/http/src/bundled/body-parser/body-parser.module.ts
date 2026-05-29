import { Module } from '@bunito/container';
import { BodyParser } from './body-parser';

@Module({
  extensions: [BodyParser],
})
export class BodyParserModule {}
