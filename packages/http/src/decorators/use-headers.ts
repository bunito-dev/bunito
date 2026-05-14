import { isObject, isString } from '@bunito/common';
import type { ClassDecorator, ClassMethodDecorator } from '@bunito/container';
import { createClassPropDecorator } from '@bunito/container';
import { HTTP_CONTROLLER_KEY } from '../constants';
import type { HTTPHeaderName, HTTPHeaders } from '../types';
import type { HeadersDecorator } from './types';

export function UseHeaders(name: HTTPHeaderName, value: string): HeadersDecorator;
export function UseHeaders(headers: HTTPHeaders): HeadersDecorator;
export function UseHeaders(
  headersOrName: HTTPHeaders | HTTPHeaderName,
  value?: string,
): ClassMethodDecorator | ClassDecorator {
  let headers: HTTPHeaders = {};

  if (isString(headersOrName, false)) {
    headers[headersOrName] = value ?? '';
  } else if (isObject(headersOrName)) {
    headers = headersOrName;
  }

  return createClassPropDecorator(HTTP_CONTROLLER_KEY, { kind: 'headers', headers });
}
