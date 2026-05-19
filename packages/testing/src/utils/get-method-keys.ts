import { isFn } from '@bunito/common';

export function getMethodKeys<TObj extends object>(obj: TObj): (keyof TObj)[] {
  const keys = new Set<keyof TObj>();

  let current: object | null = obj;

  while (current && current !== Object.prototype) {
    for (const key of Reflect.ownKeys(current)) {
      if (key === 'constructor') {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(current, key);

      if (isFn(descriptor?.value)) {
        keys.add(key as keyof TObj);
      }
    }

    current = Object.getPrototypeOf(current);
  }

  return [...keys];
}
