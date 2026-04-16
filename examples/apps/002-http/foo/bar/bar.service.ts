import { setTimeout } from 'node:timers/promises';
import { Provider } from '@bunito/bunito';

@Provider()
export class BarService {
  constructor(readonly createdAt = Date.now()) {}

  hello() {
    return `Hello from BarService! (created at ${this.createdAt})`;
  }

  async delayedHello(delay: number) {
    // A tiny async example used by the validated delay endpoint.
    await setTimeout(delay);

    return `Delayed (${delay}ms) hello from BarService! (created at ${this.createdAt})`;
  }
}
