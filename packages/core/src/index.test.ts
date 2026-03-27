import { describe, expect, it } from 'bun:test';
import * as core from './index';

describe('core index exports', () => {
  it('should re-export the main public API', () => {
    expect(core.App).toBeDefined();
    expect(core.Container).toBeDefined();
    expect(core.Module).toBeDefined();
    expect(core.Provider).toBeDefined();
    expect(core.ConfigService).toBeDefined();
    expect(core.configModule).toBeDefined();
    expect(core.Logger).toBeDefined();
    expect(core.LoggerModule).toBeDefined();
    expect(core.registerConfig).toBeDefined();
  });
});
