import { Module } from '@bunito/bunito';
import { ClientService } from './client.service';

@Module({
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
