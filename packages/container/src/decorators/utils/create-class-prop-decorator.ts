import { CLASS_METADATA_KEYS } from '../constants';
import type {
  ClassDecorator,
  ClassFieldDecorator,
  ClassMethodDecorator,
  ClassPropDecorator,
  ClassPropDecoratorContext,
  ClassPropsMetadata,
} from '../types';

export function createClassPropDecorator<
  TOptions = unknown,
  TDecorator extends
    | ClassDecorator
    | ClassFieldDecorator
    | ClassMethodDecorator
    | ClassPropDecorator = ClassPropDecorator,
>(key: symbol, options: TOptions): TDecorator {
  return ((target: unknown, context: ClassPropDecoratorContext) => {
    context.metadata[CLASS_METADATA_KEYS.props] ??= new Map();

    (context.metadata[CLASS_METADATA_KEYS.props] as ClassPropsMetadata)
      .getOrInsertComputed(key, () => [])
      .push(
        context.kind === 'class'
          ? {
              propKind: 'class',
              options,
            }
          : {
              propKind: context.kind,
              propKey: context.name,
              options,
            },
      );

    return target;
  }) as TDecorator;
}
