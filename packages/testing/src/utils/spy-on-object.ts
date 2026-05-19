import { spyOn } from 'bun:test';
import type { SpiedObject } from '../types';
import { getMethodKeys } from './get-method-keys';

export function spyOnObject<TObj extends object>(obj: TObj): SpiedObject<TObj> {
  for (const key of getMethodKeys(obj)) {
    spyOn(obj, key);
  }

  return obj as SpiedObject<TObj>;
}
