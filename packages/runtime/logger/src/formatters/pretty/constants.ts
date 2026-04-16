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
    primary: 'yellow',
    secondary: 'yellowBright',
    text: 'yellowBright',
  },
  INFO: {
    icon: '➥',
    primary: 'blue',
    secondary: 'blueBright',
    text: 'white',
  },
  OK: {
    icon: '✔',
    primary: 'green',
    secondary: 'greenBright',
    text: 'white',
  },
  DEBUG: {
    icon: '➥',
    primary: 'cyan',
    secondary: 'cyanBright',
    text: 'white',
  },
  VERBOSE: {
    icon: '➥',
    primary: 'gray',
    secondary: 'gray',
    text: 'gray',
  },
};
