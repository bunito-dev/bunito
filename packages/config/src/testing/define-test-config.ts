import type { ConfigProvider } from '../types';

export function defineTestConfig<TConfig>(
  provider: ConfigProvider<TConfig>,
  config: TConfig,
): ConfigProvider<TConfig> {
  return {
    token: provider.token,
    useValue: config,
  };
}
