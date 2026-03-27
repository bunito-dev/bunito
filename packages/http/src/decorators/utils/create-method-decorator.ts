import type { Fn } from '@bunito/common';
import { pushDecoratorMetadata } from '@bunito/common';
import { HTTP_CONTROLLER_METADATA_KEYS } from '../../constants';
import type { HttpHandlerOptions, HttpMethod, HttpPath } from '../../types';

export type MethodDecoratorOptions = Partial<Omit<HttpHandlerOptions, 'name' | 'method'>>;

export type MethodDecorator<TOmit extends keyof MethodDecoratorOptions> = (
  optionsLike?: Omit<MethodDecoratorOptions, TOmit> | HttpPath,
) => <TTarget extends Fn>(
  target: TTarget,
  context: ClassMethodDecoratorContext,
) => TTarget;

export function createMethodDecorator<TOmit extends keyof MethodDecoratorOptions = never>(
  method: HttpMethod,
): MethodDecorator<TOmit> {
  return (optionsLike?) => (target, context) => {
    let options: MethodDecoratorOptions;

    switch (typeof optionsLike) {
      case 'string':
        options = {
          path: optionsLike,
        };
        break;

      case 'object':
        options = optionsLike ?? {};
        break;

      default:
        options = {};
    }

    pushDecoratorMetadata<HttpHandlerOptions>(
      context,
      HTTP_CONTROLLER_METADATA_KEYS.methods,
      {
        path: '/',
        method,
        name: context.name,
        ...options,
      },
    );

    return target;
  };
}
