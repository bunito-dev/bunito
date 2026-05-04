import { describe, expect, it } from 'bun:test';
import { APP_COLORS, PROJECT_DIRS, PROJECT_FILES } from './constants';

describe('project constants', () => {
  it('exports project directory, file, and color defaults', () => {
    expect(PROJECT_DIRS).toEqual({
      apps: 'apps',
      libs: 'libs',
    });
    expect(PROJECT_FILES).toEqual({
      config: 'bunito.json',
      pkg: 'package.json',
      tsconfig: 'tsconfig.json',
    });
    expect(APP_COLORS).toEqual(['cyan', 'magenta', 'blue', 'green', 'yellow']);
  });
});
