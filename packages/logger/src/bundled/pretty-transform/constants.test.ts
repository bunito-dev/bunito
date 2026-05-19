import { describe, expect, it } from 'bun:test';
import { LOG_LEVELS } from '../../constants';
import { PRETTY_LEVEL_THEMES } from './constants';

describe('PRETTY_LEVEL_THEMES', () => {
  it('defines a theme for every log level', () => {
    expect(Object.keys(PRETTY_LEVEL_THEMES).sort()).toEqual(
      Object.keys(LOG_LEVELS).sort(),
    );
  });
});
