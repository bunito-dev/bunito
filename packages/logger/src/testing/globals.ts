declare global {
  namespace Bunito {
    interface Test {
      LoggerModule: import('@bunito/container').ModuleOptions;
      getLogger: import('./types').TestLoggerGetter;
    }
  }
}
