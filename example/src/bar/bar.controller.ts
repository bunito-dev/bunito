import { Controller } from '@bunito/core';
import { Get } from '@bunito/http';
import { BarService } from './bar.service';

@Controller({
  injects: [BarService],
})
export class BarController {
  constructor(private readonly barService: BarService) {}

  @Get({
    path: '/bar',
  })
  bar() {
    return {
      message: 'bar',
      config: this.barService.getConfig(),
    };
  }
}
