import './polyfills';

export function pushDecoratorMetadata<TItem>(
  { metadata }: DecoratorContext,
  key: PropertyKey,
  item: TItem,
): void {
  if (Array.isArray(metadata[key])) {
    metadata[key].push(item);
  } else {
    metadata[key] = [item];
  }
}
