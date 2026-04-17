import type { OnRequestContext } from '@bunito/http';
import { Controller, OnRequest } from '@bunito/http';

@Controller()
export class AppController {
  @OnRequest({
    path: '/**',
    priority: 'high',
  })
  async bodyParser(context: OnRequestContext): Promise<undefined> {
    const { request, contentType } = context;

    if (contentType === 'application/json') {
      context.body = await request.json();
    }
  }
}
