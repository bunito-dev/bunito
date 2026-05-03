declare global {
  namespace Bunito {
    interface ModuleProviders {
      providers: import('./compiler').ProviderLike[];
      extensions: import('./compiler').ProviderLike[];
    }
  }
}
