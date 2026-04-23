import { HttpException } from '@bunito/server';

export class UpgradeRequiredException extends HttpException {
  constructor(message?: string) {
    super('UPGRADE_REQUIRED', message);
  }
}
