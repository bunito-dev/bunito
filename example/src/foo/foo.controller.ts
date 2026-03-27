import { Controller } from '@bunito/core';
import type { HttpContext } from '@bunito/http';
import { Get, Post } from '@bunito/http';
import { z } from 'zod';

const test2Schema = {
  query: z.object({
    id: z.string(),
  }),
};

@Controller({
  injects: [
    {
      token: 1,
      optional: true,
    },
  ],
})
export class FooController {
  @Get({
    path: '/',
  })
  @Post('/')
  foo() {
    return {
      message: 'foo',
    };
  }

  @Get({
    path: '/',
  })
  test1() {
    return {
      message: 'test1',
    };
  }

  @Get({
    path: '/test2',
    schema: test2Schema,
  })
  test2(context: HttpContext<typeof test2Schema>) {
    return {
      message: 'test1',
      queryId: context.query.id,
    };
  }
}
