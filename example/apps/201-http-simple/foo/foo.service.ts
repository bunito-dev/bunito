import { Provider } from '@bunito/bunito';

@Provider({
  // Request scope makes it easy to demonstrate that a fresh provider instance is created per call.
  scope: 'request',
})
export class FooService {
  constructor(readonly createdAt = Date()) {}

  hello() {
    return `Hello from FooService! (created at ${this.createdAt})`;
  }
}
