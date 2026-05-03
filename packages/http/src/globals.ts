declare global {
  namespace Bunito {
    interface ModuleProviders {
      controllers: import('@bunito/common').Class[];
    }
  }
}
