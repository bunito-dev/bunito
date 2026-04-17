import type { OnRequestContext } from '@bunito/http';
import { Controller, OnPost } from '@bunito/http';
import { ValidSchema } from './schemas';

@Controller('/foo')
export class FooController {
  /**
   * POST /foo/raw
   */
  @OnPost('/raw')
  rawBody(
    context: OnRequestContext<{
      body: {
        foo: string;
      };
    }>,
  ) {
    const { body } = context;

    return {
      controller: 'FooController',
      method: 'rawBody',
      body,
    };
  }

  /**
   * POST /foo/valid
   */
  @OnPost('/valid', ValidSchema)
  validBody(context: OnRequestContext<typeof ValidSchema>) {
    const {
      body: { foo },
    } = context;

    return {
      controller: 'FooController',
      method: 'validBody',
      body: {
        foo,
      },
    };
  }
}
