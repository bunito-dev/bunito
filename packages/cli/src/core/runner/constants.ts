export const DEFAULT_PROCESS_ENVS = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => {
    switch (key) {
      case 'PATH':
      case 'USER':
      case 'TZ':
      case 'LANG':
      case 'PWD':
        return true;

      default:
        return key.startsWith('npm_') || key.startsWith('BUN_');
    }
  }),
);
