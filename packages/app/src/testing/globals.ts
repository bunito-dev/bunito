declare global {
  namespace Bunito {
    interface Test {
      App: typeof import('../app').App;
    }
  }
}
