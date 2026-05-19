import { ConfigModule, LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { AppController } from './app-controller';

@Module({
  imports: [HTTPModule, LoggerModule, ConfigModule],
  controllers: [AppController],
})
export class AppModule {}
