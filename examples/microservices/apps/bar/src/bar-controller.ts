import { BrokerService, Data, OnMessage } from '@bunito/broker';
import { Controller, Logger } from '@bunito/bunito';
import { Get, Query } from '@bunito/http';

@Controller('bar', {
  injects: [Logger, BrokerService],
})
export class BarController {
  constructor(
    private readonly logger: Logger,
    private readonly brokerService: BrokerService,
  ) {
    logger.setContext(BarController);
  }

  @Get('/', {
    injects: [Query],
  })
  async sendMessage(query: Query<{ message?: string | string[] }>) {
    const { message = 'Hello from bar!' } = query;

    this.logger.debug('sendMessage() called:', { message });

    const reply = await this.brokerService.sendRequest<string>('foo.process', message);

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

    return `${data} ... I'm bar!`;
  }
}
