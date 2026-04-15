import { Controller, OnGet, OnResponse } from '@bunito/http';
import { FooService } from './foo.service';

@Controller({
  injects: [FooService],
})
export class FooController {
  constructor(private readonly fooService: FooService) {}

  @OnGet()
  index() {
    return {
      foo: this.fooService.foo(),
      createdAt: this.fooService.createdAt,
    };
  }

  @OnResponse()
  formatResponse(data: unknown) {
    return Response.json({
      foo: data,
    });
  }
}
