import { BrokerService } from '@bunito/broker';
import { optional, Provider } from '@bunito/bunito';

@Provider({
  injects: [optional(BrokerService)],
})
export class ClientService {
  constructor(private readonly brokerService: BrokerService | null) {}

  async processFoo(message: string | string[]): Promise<string | unknown> {
    return this.brokerService?.sendRequest<string>('foo.process', message);
  }

  async processBar(message: string | string[]): Promise<string | unknown> {
    return this.brokerService?.sendRequest<string>('bar.process', message);
  }
}
