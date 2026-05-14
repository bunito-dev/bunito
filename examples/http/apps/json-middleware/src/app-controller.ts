import { Controller } from '@bunito/bunito';
import { Get } from '@bunito/http';

@Controller()
export class AppController {
  @Get()
  index() {
    return Response.json({
      example: 'json-middleware',
    });
  }
}
