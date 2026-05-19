import { mock } from 'bun:test';
import type { Class } from '@bunito/common';
import { isFn } from '@bunito/common';
import type { MockedObject } from '../types';
import { getMethodKeys } from './get-method-keys';

export function mockClass<TClass extends Class>(
  cls: TClass,
  proto: Partial<InstanceType<TClass>> = {},
): MockedObject<InstanceType<TClass>> {
  const obj: Record<PropertyKey, unknown> = {
    ...proto,
  };

  for (const key of getMethodKeys(cls.prototype)) {
    obj[key] = isFn(obj[key]) ? mock(obj[key]) : mock();
  }

  return obj as MockedObject<InstanceType<TClass>>;
}
