import type { ModuleOptions } from '@bunito/core';
import { App, LoggerModule } from '@bunito/core';
import { HttpModule, HttpService } from '@bunito/http';
import { BarModule } from './bar';
import { FooModule } from './foo';

const AppModule: ModuleOptions = {
  imports: [FooModule, BarModule, HttpModule, LoggerModule],
};

const app = await App.create('example', AppModule);

const httpService = await app.resolve(HttpService);

app.logger?.verbose('Routes:', ...httpService.inspectRoutes());

await app.bootstrap();
