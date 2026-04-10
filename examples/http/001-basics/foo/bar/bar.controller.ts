import { Controller } from '@bunito/core';
import type { OnRequestContext } from '@bunito/http';
import { OnGet } from '@bunito/http';
import { BarService } from './bar.service';
import { BarSchema } from './schemas';

@Controller({
  injects: [BarService],
})
export class BarController {
  constructor(private readonly barService: BarService) {}

  @OnGet('/bar')
  async index() {
    return {
      bar: await this.barService.bar(),
      createdAt: this.barService.createdAt,
    };
  }

  @OnGet('/bar/:delay', BarSchema)
  async bar(context: OnRequestContext<typeof BarSchema>) {
    const { delay } = context.params;

    return {
      bar: await this.barService.bar(delay),
      delay,
      createdAt: this.barService.createdAt,
    };
  }
}
