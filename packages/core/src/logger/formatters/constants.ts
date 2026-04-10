import type { InspectColor } from 'node:util';
import type { LogLevelKind } from '../types';

export const PRETTIFY_LEVEL_THEMES: Record<
  LogLevelKind,
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
    text: 'blueBright',
  },
  OK: {
    icon: '✔',
    primary: 'green',
    secondary: 'greenBright',
    text: 'greenBright',
  },
  DEBUG: {
    icon: '➥',
    primary: 'cyan',
    secondary: 'cyanBright',
    text: 'cyanBright',
  },
  VERBOSE: {
    icon: '➥',
    primary: 'gray',
    secondary: 'gray',
    text: 'gray',
  },
};
