import type { Fn } from '@bunito/common';
import { isObject, isString } from '@bunito/common';
import type { ClassMethodDecorator } from '@bunito/container/internals';
import { ClassMethod } from '@bunito/container/internals';
import type { HttpMethod, HttpPath } from '@bunito/server';
import { CONTROLLER_COMPONENT } from '../constants';
import type { RouteOptions } from '../types';
import type { RouteDecorator } from './types';

function createRouteDecorator<TOmit extends keyof RouteOptions = never>(
  method?: HttpMethod,
): RouteDecorator<TOmit> {
  return (
    pathOrOptions?: HttpPath | RouteOptions,
    extraOptions?: Omit<RouteOptions, 'path'>,
  ): ClassMethodDecorator => {
    let options: RouteOptions = {
      method,
    };

    if (isString(pathOrOptions)) {
      options.path = pathOrOptions;

      if (isObject(extraOptions)) {
        options = { ...options, ...extraOptions };
      }
    } else if (isObject(pathOrOptions)) {
      options = { ...options, ...pathOrOptions };
    }

    return ClassMethod<Fn, RouteOptions>(CONTROLLER_COMPONENT, options);
  };
}

export const Route: RouteDecorator = createRouteDecorator();

export const All: RouteDecorator<'method'> = createRouteDecorator();

export const Get: RouteDecorator<'method'> = createRouteDecorator('GET');

export const Post: RouteDecorator<'method'> = createRouteDecorator('POST');

export const Put: RouteDecorator<'method'> = createRouteDecorator('PUT');

export const Delete: RouteDecorator<'method'> = createRouteDecorator('DELETE');

export const Patch: RouteDecorator<'method'> = createRouteDecorator('PATCH');
