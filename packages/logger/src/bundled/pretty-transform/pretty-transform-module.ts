import { Module } from '@bunito/container';
import { PrettyTransform } from './pretty-transform';
import { PrettyTransformConfig } from './pretty-transform-config';

@Module({
  configs: [PrettyTransformConfig],
  extensions: [PrettyTransform],
})
export class PrettyTransformModule {}
