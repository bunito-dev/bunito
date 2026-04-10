import { Provider } from '@bunito/core';

@Provider({
  scope: 'request',
})
export class FooService {
  constructor(readonly createdAt = Date.now()) {}

  foo() {
    return 'foo';
  }
}
