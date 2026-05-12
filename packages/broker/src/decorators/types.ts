import type { Fn, MaybePromise } from '@bunito/common';
import type { ClassMethodDecorator } from '@bunito/container/internals';

export type HandlerDecorator = ClassMethodDecorator<Fn<MaybePromise>>;
