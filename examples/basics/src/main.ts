import { createApp } from '@bunito/bunito';
import { BarService } from './bar.service';
import { FooService } from './foo.service';
import { MainModule } from './main.module';

const app = await createApp(MainModule);

// Providers can also be resolved manually when an app needs direct access.
const bar = await app.resolve(BarService);
const foo = await app.resolve(FooService);

bar.bar();
foo.foo();
foo.fooBar();

// Starting triggers boot hooks; shutdown disposes providers with destroy hooks.
await app.start();
await app.shutdown();
