import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '@bunito/container';
import { FORMATTER_EXTENSION } from './constants';
import { Formatter } from './formatter.decorator';

describe('Formatter', () => {
  it('stores formatter extension metadata', () => {
    class FormatterTarget {
      formatLog(): string {
        return '';
      }
    }

    const metadata = {} as DecoratorMetadata;

    Formatter('Pretty', { injects: ['config'] })(FormatterTarget, { metadata } as never);

    expect(metadata[DECORATOR_METADATA_KEYS.EXTENSION_KEY]).toBe(FORMATTER_EXTENSION);
    expect(metadata[DECORATOR_METADATA_KEYS.EXTENSION_OPTIONS]).toBe('pretty');
    expect(metadata[DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS]).toEqual({
      scope: 'singleton',
      injects: ['config'],
    });
  });
});
