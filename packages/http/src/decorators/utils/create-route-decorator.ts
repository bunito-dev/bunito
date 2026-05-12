import { isObject, isString } from '@bunito/common';
import { createClassPropDecorator } from '@bunito/container/internals';
import { HTTP_CONTROLLER_KEY } from '../../constants';
import type {
  ControllerMethodOptions,
  HTTPPath,
  RouteMethod,
  RouteOptions,
} from '../../types';
import type { RouteDecorator, RouteDecoratorOptions } from '../types';

export function createRouteDecorator<TOmit extends keyof RouteOptions = never>(
  method: RouteMethod,
  pathOrOptions?: HTTPPath | RouteDecoratorOptions<TOmit>,
  extraOptions?: RouteDecoratorOptions<'path' | TOmit>,
): RouteDecorator {
  let options: Partial<RouteOptions>;

  if (isString(pathOrOptions)) {
    options = {
      path: pathOrOptions,
      ...(extraOptions ?? {}),
    };
  } else if (isObject(pathOrOptions)) {
    options = pathOrOptions;
  } else {
    options = {};
  }

  return createClassPropDecorator<ControllerMethodOptions, RouteDecorator>(
    HTTP_CONTROLLER_KEY,
    {
      kind: 'route',
      options: {
        path: '/',
        method,
        ...options,
      },
    },
  );
}
