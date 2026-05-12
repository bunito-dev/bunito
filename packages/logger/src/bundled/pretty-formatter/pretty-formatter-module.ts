import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';
import { PrettyFormatter } from './pretty-formatter';
import { PrettyFormatterConfig } from './pretty-formatter-config';

@Module({
  imports: [ConfigModule],
  configs: [PrettyFormatterConfig],
  extensions: [PrettyFormatter],
})
export class PrettyFormatterModule {}
