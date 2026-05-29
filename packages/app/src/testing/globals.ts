declare global {
  namespace Bunito {
    interface Test {
      createApp: import('../types').AppFactory;
      startApp: import('../types').AppFactory;
    }
  }
}
