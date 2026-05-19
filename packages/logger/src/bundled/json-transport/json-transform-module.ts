import { Module } from '@bunito/container';
import { JSONTransform } from './json-transform';

@Module({
  extensions: [JSONTransform],
})
export class JSONTransformModule {}
