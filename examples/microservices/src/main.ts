import { App } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { AppModule } from './app-module';

await App.start(AppModule, HTTPModule);
