import type { Class } from '@bunito/common';
import { MODULE_METADATA_KEY } from '../constants';
import type { ModuleMetadata } from '../types';
import './polyfill';

export function getModuleMetadata(targetClass: Class): ModuleMetadata | undefined {
  return targetClass[Symbol.metadata]?.[MODULE_METADATA_KEY] as ModuleMetadata;
}
