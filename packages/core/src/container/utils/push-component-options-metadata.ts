import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ComponentKey } from '../types';

export function pushComponentOptionsMetadata(
  metadata: DecoratorMetadata,
  componentKey: ComponentKey,
  options: unknown,
): void {
  metadata[DECORATOR_METADATA_KEYS.COMPONENT_OPTIONS] ??= new Map();

  (metadata[DECORATOR_METADATA_KEYS.COMPONENT_OPTIONS] as Map<ComponentKey, unknown[]>)
    .getOrInsertComputed(componentKey, () => [])
    .push(options);
}
