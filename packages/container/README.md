# `@bunito/container`

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
