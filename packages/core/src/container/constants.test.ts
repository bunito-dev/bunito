import { describe, expect, it } from 'bun:test';
import {
  DECORATOR_METADATA_KEYS,
  GLOBAL_SCOPE_ID,
  MODULE_ID,
  PARENT_MODULE_IDS,
  REQUEST_ID,
  ROOT_MODULE_ID,
} from './constants';

describe('DECORATOR_METADATA_KEYS', () => {
  it('exposes unique metadata symbols', () => {
    expect(DECORATOR_METADATA_KEYS.MODULE_OPTIONS).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.PROVIDER_EVENTS).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.EXTENSION_KEY).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.EXTENSION_OPTIONS).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.COMPONENT_FIELDS).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.COMPONENT_KEYS).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.COMPONENT_METHODS).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.COMPONENT_OPTIONS).toBeSymbol();
  });
});

describe('GLOBAL_SCOPE_ID', () => {
  it('uses a stable id name', () => {
    expect(`${GLOBAL_SCOPE_ID}`).toBe('GLOBAL_SCOPE_ID');
  });
});

describe('REQUEST_ID', () => {
  it('uses a stable id name', () => {
    expect(`${REQUEST_ID}`).toBe('REQUEST_ID');
  });
});

describe('MODULE_ID', () => {
  it('uses a stable id name', () => {
    expect(`${MODULE_ID}`).toBe('MODULE_ID');
  });
});

describe('ROOT_MODULE_ID', () => {
  it('uses a stable id name', () => {
    expect(`${ROOT_MODULE_ID}`).toBe('ROOT_MODULE_ID');
  });
});

describe('PARENT_MODULE_IDS', () => {
  it('uses a stable id name', () => {
    expect(`${PARENT_MODULE_IDS}`).toBe('PARENT_MODULE_IDS');
  });
});
