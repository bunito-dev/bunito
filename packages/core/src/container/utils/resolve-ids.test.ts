import { describe, expect, it } from 'bun:test';
import { Provider } from '../decorators';
import { resolveModuleId } from './resolve-module-id';
import { resolveProviderId } from './resolve-provider-id';

describe('resolve ids', () => {
  it('should resolve module ids from tokens and module-like objects', () => {
    class InlineModule {}
    const tokenizedModule = { token: 'module-token', providers: [] };

    expect(resolveModuleId(InlineModule)).toBe(resolveModuleId(InlineModule));
    expect(resolveModuleId(tokenizedModule)).toBe(resolveModuleId(tokenizedModule));
  });

  it('should resolve provider ids from classes, factories and tokenized providers', () => {
    @Provider()
    class Service {}

    const factory = () => 'value';

    expect(resolveProviderId(Service)).toBe(resolveProviderId(Service));
    expect(resolveProviderId({ token: 'provider-token', useValue: 1 })).toBe(
      resolveProviderId('provider-token'),
    );
    expect(resolveProviderId({ useFactory: factory })).toBe(resolveProviderId(factory));
    expect(resolveProviderId({ useClass: Service })).toBe(resolveProviderId(Service));
  });
});
