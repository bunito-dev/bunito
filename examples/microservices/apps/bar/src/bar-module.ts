import { Module } from '@bunito/bunito';
import { JSONSerializer, UseMiddleware } from '@bunito/http';
import { BarController } from './bar-controller';

@Module({
  controllers: [BarController],
})
@UseMiddleware(JSONSerializer)
export class BarModule {}
