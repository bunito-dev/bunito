import { Data, OnMessage } from '@bunito/broker';
import { Controller, Logger, optional } from '@bunito/bunito';
import { Get, Query } from '@bunito/http';
import { ClientService } from '@libs/client';

@Controller('bar', {
  injects: [optional(Logger), ClientService],
})
export class BarController {
  constructor(
    private readonly logger: Logger | null,
    private readonly clientService: ClientService,
  ) {}

  @Get('/', {
    injects: [Query],
  })
  async sendMessage(
    query: Query<{
      message?: string | string[];
    }>,
  ): Promise<Response> {
    const { message = 'Hello from bar!' } = query;

    this.logger?.debug('sendMessage() called:', { message });

    return Response.json({
      message,
      reply: await this.clientService.processFoo(message),
    });
  }

  // topic with prefix: bar.process
  @OnMessage('process', {
    injects: [Data],
  })
  processMessage(data: string) {
    this.logger?.debug('processMessage() called:', { data });

    return `${data} ... I'm bar!`;
  }
}
