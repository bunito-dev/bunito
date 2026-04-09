import { Exception } from '@bunito/common';

export class InternalException extends Exception {
  override name = 'InternalException';
}
