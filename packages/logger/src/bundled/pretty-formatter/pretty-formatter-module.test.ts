import { describe, expect, it } from 'bun:test';
import { ConfigModule } from '@bunito/config';
import { getClassMetadata } from '@bunito/container';
import { PrettyFormatter } from './pretty-formatter';
import { PrettyFormatterConfig } from './pretty-formatter-config';
import { PrettyFormatterModule } from './pretty-formatter-module';

describe('PrettyFormatterModule', () => {
  it('registers pretty formatter config and extension', () => {
    expect(getClassMetadata(PrettyFormatterModule, 'module')).toEqual({
      imports: [ConfigModule],
      configs: [PrettyFormatterConfig],
      extensions: [PrettyFormatter],
    });
  });
});
