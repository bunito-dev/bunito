import { Controller } from '@bunito/core';
import { Get } from '@bunito/http';

@Controller()
export class DemoController {
  @Get('/demo')
  demo() {
    return {
      message: 'demo',
    };
  }
}
