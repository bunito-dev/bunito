# `@bunito/config`

Configuration module for bunito applications.

It provides config factories, environment parsing, typed value formatting, and
secret lookup through pluggable extensions.

## Installation 📦

```bash
bun add @bunito/config
```

## Usage ✨

```ts
import { ConfigModule, defineConfig } from '@bunito/config';
import { Module } from '@bunito/container';

const AppConfig = defineConfig(function AppConfig({ getEnv }) {
  return {
    port: getEnv('PORT', 'port') ?? 3000,
  };
});

@Module({
  imports: [ConfigModule],
  configs: [AppConfig],
})
class AppModule {}
```

## License

MIT
