import { Controller, Logger, optional } from '@bunito/bunito';
import { Get, UseCORS } from '@bunito/http';

@Controller({
  injects: [optional(Logger)],
})
@UseCORS({
  methods: ['GET'],
})
export class FooController {
  constructor(private readonly logger: Logger | null) {
    this.logger?.debug('created');
  }

  @Get()
  getFoo(): Response {
    this.logger?.debug('getFoo() called');

    return Response.json({
      foo: 'Hello foo!',
    });
  }
}
