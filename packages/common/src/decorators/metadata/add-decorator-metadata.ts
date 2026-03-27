import './polyfills';

export function addDecoratorMetadata<TItem>(
  { metadata }: DecoratorContext,
  key: PropertyKey,
  item: TItem,
): void {
  if (metadata[key] instanceof Set) {
    metadata[key].add(item);
  } else {
    metadata[key] = new Set([item]);
  }
}
