import { Controller } from '@bunito/bunito';
import { Get } from '@bunito/http';
import { EXAMPLE_NAME_ID } from './constants';

@Controller({
  scope: 'singleton',
  injects: [EXAMPLE_NAME_ID],
})
export class ExampleController {
  constructor(private readonly name: string) {
    //
  }

  @Get()
  index() {
    return Response.json({
      example: this.name,
    });
  }
}
