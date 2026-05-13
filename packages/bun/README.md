# `@bunito/bun`

Bun-specific integrations for bunito applications.

It provides Bun platform modules, including server and secret integrations used by
higher-level packages such as `@bunito/http`.

## Installation 📦

```bash
bun add @bunito/bun
```

## Usage ✨

```ts
import { SecretsModule } from '@bunito/bun';
import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';

@Module({
  imports: [ConfigModule, SecretsModule],
})
class AppModule {}
```

## License

MIT
