import type { InspectColor } from 'node:util';
import type { LogLevelKind } from '../../types';

export const PRETTY_LEVEL_THEMES: Record<
  LogLevelKind,
  {
    primary: InspectColor;
    secondary: InspectColor;
    text: InspectColor;
  }
> = {
  FATAL: {
    primary: 'redBright',
    secondary: 'redBright',
    text: 'redBright',
  },
  ERROR: {
    primary: 'red',
    secondary: 'red',
    text: 'red',
  },
  WARN: {
    primary: 'yellowBright',
    secondary: 'yellow',
    text: 'yellowBright',
  },
  INFO: {
    primary: 'blueBright',
    secondary: 'blue',
    text: 'white',
  },
  OK: {
    primary: 'greenBright',
    secondary: 'green',
    text: 'white',
  },
  DEBUG: {
    primary: 'cyanBright',
    secondary: 'cyan',
    text: 'white',
  },
  VERBOSE: {
    primary: 'gray',
    secondary: 'gray',
    text: 'gray',
  },
};
