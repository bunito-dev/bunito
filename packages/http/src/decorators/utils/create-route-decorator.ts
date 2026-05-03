import type { Fn } from '@bunito/common';
import { isObject, isString } from '@bunito/common';
import { createComponentDecorator } from '@bunito/container/internals';
import type {
  ControllerMethodOptions,
  HTTPMethod,
  HTTPPath,
  RouteOptions,
} from '../../types';
import { Controller } from '../controller.decorator';
import type { RouteDecorator, RouteDecoratorOptions } from '../types';

export function createRouteDecorator<TOmit extends keyof RouteOptions = never>(
  decorator: Fn,
  method?: HTTPMethod,
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

  return createComponentDecorator<RouteDecorator, ControllerMethodOptions>(
    Controller,
    {
      kind: 'route',
      options: {
        path: '/',
        method,
        ...options,
      },
    },
    decorator,
  );
}
