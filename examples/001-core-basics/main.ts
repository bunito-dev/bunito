import type { ModuleOptions } from '@bunito/core';
import { App, LoggerModule, Provider } from '@bunito/core';

@Provider()
class BarService {
  bar(): Array<string> {
    return ['bar'];
  }
}

@Provider({
  injects: [BarService],
})
class FooService {
  constructor(private readonly barService: BarService) {
    //
  }

  foo(): Array<string> {
    return ['foo'];
  }

  bar(): Array<string> {
    return this.foo().concat(this.barService.bar());
  }
}

const AppModule: ModuleOptions = {
  imports: [LoggerModule],
  providers: [FooService, BarService],
};

const app = await App.create('example', AppModule);

const fooService = await app.resolve(FooService);
const barService = await app.resolve(BarService);

app.logger?.debug(`fooService.foo()`, fooService.foo());
app.logger?.debug(`fooService.bar()`, fooService.bar());
app.logger?.debug(`barService.bar()`, barService.bar());

await app.boot();
await app.destroy();
