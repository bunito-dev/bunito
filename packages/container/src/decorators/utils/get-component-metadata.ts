import type { Class } from '@bunito/common';
import { COMPONENT_METADATA_KEY } from '../constants';
import type { ComponentMetadata } from '../types';
import './polyfill';

export function getComponentMetadata(targetClass: Class): ComponentMetadata | undefined {
  return targetClass[Symbol.metadata]?.[COMPONENT_METADATA_KEY] as ComponentMetadata;
}
