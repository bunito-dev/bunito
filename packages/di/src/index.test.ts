import { describe, expect, it } from 'bun:test';
import * as publicApi from './index';

describe('index', () => {
  it('re-exports public APIs', () => {
    expect(publicApi.Container).toBeFunction();
    expect(publicApi.Id).toBeFunction();
    expect(publicApi.Module).toBeFunction();
    expect(publicApi.Provider).toBeFunction();
    expect(publicApi.OnInit).toBeFunction();
    expect(publicApi.OnResolve).toBeFunction();
    expect(publicApi.OnDestroy).toBeFunction();
    expect(publicApi.MODULE_ID).toBeDefined();
    expect(publicApi.REQUEST_ID).toBeDefined();
    expect(publicApi.PROVIDER_OPTIONS).toBeDefined();
  });
});
