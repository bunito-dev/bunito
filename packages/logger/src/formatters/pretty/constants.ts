import type { InspectColor } from 'node:util';
import type { LogLevel } from '../../types';

export const PRETTY_LEVEL_THEMES: Record<
  LogLevel,
  {
    icon: string;
    primary: InspectColor;
    secondary: InspectColor;
    text: InspectColor;
  }
> = {
  FATAL: {
    icon: '☠',
    primary: 'redBright',
    secondary: 'redBright',
    text: 'redBright',
  },
  ERROR: {
    icon: '✘',
    primary: 'red',
    secondary: 'red',
    text: 'red',
  },
  WARN: {
    icon: '➥',
    primary: 'yellowBright',
    secondary: 'yellow',
    text: 'yellowBright',
  },
  INFO: {
    icon: '➥',
    primary: 'blueBright',
    secondary: 'blue',
    text: 'white',
  },
  OK: {
    icon: '✔',
    primary: 'greenBright',
    secondary: 'green',
    text: 'white',
  },
  DEBUG: {
    icon: '➥',
    primary: 'cyanBright',
    secondary: 'cyan',
    text: 'white',
  },
  VERBOSE: {
    icon: '➥',
    primary: 'gray',
    secondary: 'gray',
    text: 'gray',
  },
};
