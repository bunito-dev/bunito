import { Module } from '@bunito/bunito';
import { ClientModule } from '@libs/client';
import { BarController } from './bar.controller';

@Module({
  imports: [ClientModule],
  controllers: [BarController],
})
export class BarModule {}
