import './polyfills';

export function setDecoratorMetadata<TValue>(
  { metadata }: DecoratorContext,
  key: PropertyKey,
  value: TValue,
): void {
  metadata[key] = value;
}
