# `@bunito/container`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

Dependency injection container for bunito.

It provides modules, providers, scopes, injections, lifecycle hooks, components,
and extensions.

## Installation 📦

```bash
bun add @bunito/container
```

## Usage ✨

```ts
import { Container, Module, Provider } from '@bunito/container';

@Provider()
class HelloService {
  sayHello(): string {
    return 'Hello from the container';
  }
}

@Module({
  providers: [HelloService],
})
class AppModule {}

const container = new Container(AppModule);
const hello = await container.resolveProvider(HelloService);

hello.sayHello();
```

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fcontainer
[npm-url]: https://www.npmjs.com/package/@bunito/container
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
