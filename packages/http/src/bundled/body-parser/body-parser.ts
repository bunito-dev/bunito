import { BadRequestException } from '../../exceptions';
import type { MiddlewareContext } from '../../middleware';
import { Middleware } from '../../middleware';
import type { BodyParserOptions } from './types';

@Middleware<BodyParserOptions>()
export class BodyParser implements Middleware<BodyParserOptions> {
  async beforeRequest(context: MiddlewareContext<BodyParserOptions>): Promise<void> {
    const { request, parser = 'json' } = context;

    if (!request.body || request.bodyUsed) {
      return;
    }

    try {
      switch (parser) {
        case 'arrayBuffer':
          context.body = await request.blob();
          break;

        case 'blob':
          context.body = await request.blob();
          break;

        case 'bytes':
          context.body = await request.bytes();
          break;

        case 'formData':
          context.body = await request.formData();
          break;

        case 'text':
          context.body = await request.text();
          break;

        default:
          context.body = await request.json();
      }
    } catch {
      throw new BadRequestException('Invalid Body');
    }
  }
}
