import { Bootstrap, configModule, Destroy, LoggerModule, Module } from '@bunito/core';
import { httpConfig } from './http.config';
import { HttpService } from './http.service';

@Module({
  imports: [LoggerModule, configModule],
  providers: [HttpService, httpConfig],
  exports: [HttpService],
  injects: [HttpService],
})
export class HttpModule {
  constructor(readonly httpService: HttpService) {}

  @Bootstrap()
  bootstrap(): void {
    this.httpService.startServer();
  }

  @Destroy()
  async destroy(): Promise<void> {
    await this.httpService.stop();
  }
}
