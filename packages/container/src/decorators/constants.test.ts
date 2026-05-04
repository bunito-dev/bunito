import { describe, expect, it } from 'bun:test';
import {
  COMPONENT_METADATA_KEY,
  MODULE_METADATA_KEY,
  PROVIDER_METADATA_KEY,
} from './constants';

describe('decorator constants', () => {
  it('exports stable symbol metadata keys', () => {
    expect(PROVIDER_METADATA_KEY.description).toBe('di(provider)');
    expect(MODULE_METADATA_KEY.description).toBe('di(module)');
    expect(COMPONENT_METADATA_KEY.description).toBe('di(component)');
  });
});
