import { BrokerService, Data, OnMessage } from '@bunito/broker';
import { Controller, Logger } from '@bunito/bunito';
import { Get, Query } from '@bunito/http';

@Controller('foo', {
  injects: [Logger, BrokerService],
})
export class FooController {
  constructor(
    private readonly logger: Logger,
    private readonly brokerService: BrokerService,
  ) {
    logger.setContext(FooController);
  }

  @Get('/', {
    injects: [Query],
  })
  async sendMessage(query: Query<{ message?: string | string[] }>) {
    const { message = 'Hello from foo!' } = query;

    this.logger.debug('sendMessage() called:', { message });

    const reply = await this.brokerService.sendRequest<string>('bar.process', message);

    return {
      message,
      reply,
    };
  }

  @OnMessage('process', {
    injects: [Data],
  })
  processMessage(data: string) {
    this.logger.debug('processMessage() called:', { data });

    return `${data} ... I'm foo!`;
  }
}
