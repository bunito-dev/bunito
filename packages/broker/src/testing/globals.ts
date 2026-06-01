declare global {
  namespace Bunito {
    interface Test {
      BrokerModule: import('@bunito/container').ModuleOptions;
      broker: import('./test-broker').TestBroker;
    }
  }
}
