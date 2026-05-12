declare global {
  namespace Bunito {
    interface ModuleProviders {
      providers: import('./compiler').ProviderLike[];
      controllers?: import('@bunito/common').Class[];
      extensions?: import('@bunito/common').Class[];
    }
  }
}
