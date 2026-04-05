import type { ClassMethodDecorator } from '@bunito/common';
import { isObject } from '@bunito/common';
import type { HttpMethod } from '../../../types';
import type { RouteRequestOptionsLike } from '../../types';
import { OnRequest } from '../on-request';

export function createRequestDecorator<TMethod extends HttpMethod>(
  method: TMethod,
): (optionsLike?: RouteRequestOptionsLike) => ClassMethodDecorator {
  return (optionsLike) => {
    return OnRequest(
      isObject(optionsLike) ? { ...optionsLike, method } : { path: optionsLike, method },
    );
  };
}
