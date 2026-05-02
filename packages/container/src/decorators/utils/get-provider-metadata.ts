import type { Class } from '@bunito/common';
import { PROVIDER_METADATA_KEY } from '../constants';
import type { ProviderMetadata } from '../types';
import './polyfill';

export function getProviderMetadata(targetClass: Class): ProviderMetadata | undefined {
  return targetClass[Symbol.metadata]?.[PROVIDER_METADATA_KEY] as ProviderMetadata;
}
