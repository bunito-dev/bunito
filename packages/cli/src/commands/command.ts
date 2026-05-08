import type { RawObject } from '@bunito/common';
import type { Context } from '#context';

export abstract class Command<TOptions extends RawObject = RawObject> {
  constructor(
    protected readonly options: TOptions,
    protected readonly context: Context,
  ) {}

  abstract run(): Promise<void>;
}
