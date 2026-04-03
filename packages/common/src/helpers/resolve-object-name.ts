import { isFn } from './is-fn';

export function resolveObjectName(value: object): string | undefined {
  const name = isFn(value) ? value.name : value.constructor.name;

  return name && name !== 'Object' ? name : undefined;
}
