import { setTimeout } from 'node:timers/promises';
import { Provider } from '@bunito/core';

@Provider()
export class BarService {
  constructor(readonly createdAt = Date.now()) {}

  async bar(delay = 100) {
    await setTimeout(delay);

    return 'bar';
  }
}
