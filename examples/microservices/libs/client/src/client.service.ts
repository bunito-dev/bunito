import { BrokerService } from '@bunito/broker';
import { optional, Provider } from '@bunito/bunito';

@Provider({
  injects: [optional(BrokerService)],
})
export class ClientService {
  constructor(private readonly brokerService: BrokerService | null) {}

  async processFoo(message: string | string[]): Promise<string | unknown> {
    return this.processMessage('foo', message);
  }

  async processBar(message: string | string[]): Promise<string | unknown> {
    return this.processMessage('bar', message);
  }

  private async processMessage(
    microservice: 'foo' | 'bar',
    message: string | string[],
  ): Promise<string | undefined> {
    const payload = await this.brokerService?.sendRequest(
      `${microservice}.process`,
      message,
    );
    return payload?.decode();
  }
}
