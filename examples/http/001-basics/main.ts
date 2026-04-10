import { App } from '@bunito/core';
import { RoutingService } from '@bunito/http';
import { AppModule } from './app.module';

const app = await App.create(AppModule);

const router = await app.resolve(RoutingService);

app.logger?.debug(router.inspectRoutes());

await app.boot();
