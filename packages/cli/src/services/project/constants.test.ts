import { describe, expect, it } from 'bun:test';
import {
  PROJECT_APPS_DIR,
  PROJECT_ENTRY_FILE,
  PROJECT_ENVS_FILE,
  PROJECT_LIBS_DIR,
  PROJECT_OUT_DIR,
  PROJECT_PKG_DEPT,
  PROJECT_SRC_DIR,
} from './constants';

describe('project constants', () => {
  it('exports project layout defaults', () => {
    expect(PROJECT_PKG_DEPT).toBe('@bunito/bunito');
    expect(PROJECT_SRC_DIR).toBe('src');
    expect(PROJECT_APPS_DIR).toBe('apps');
    expect(PROJECT_LIBS_DIR).toBe('libs');
    expect(PROJECT_OUT_DIR).toBe('out');
    expect(PROJECT_ENVS_FILE).toBe('.env');
    expect(PROJECT_ENTRY_FILE).toBe('src/main.ts');
  });
});
