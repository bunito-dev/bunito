import { App } from '@bunito/core';
import { AppModule } from './app.module';

// App.start() is the shortest way to create, boot, and keep the HTTP app running.
await App.start(AppModule);
