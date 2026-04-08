import type { InspectColor } from 'node:util';
import type { LogLevelKind } from '../types';

export const PRETTIFY_LEVEL_THEMES: Record<
  LogLevelKind,
  {
    icon: string;
    colorPrimary: InspectColor;
    colorSecondary: InspectColor;
    colorMessage: InspectColor;
  }
> = {
  FATAL: {
    icon: '☠',
    colorPrimary: 'redBright',
    colorSecondary: 'redBright',
    colorMessage: 'redBright',
  },
  ERROR: {
    icon: '✘',
    colorPrimary: 'red',
    colorSecondary: 'red',
    colorMessage: 'red',
  },
  WARN: {
    icon: '➥',
    colorPrimary: 'yellow',
    colorSecondary: 'yellowBright',
    colorMessage: 'yellowBright',
  },
  INFO: {
    icon: '➥',
    colorPrimary: 'blue',
    colorSecondary: 'blueBright',
    colorMessage: 'blueBright',
  },
  OK: {
    icon: '✔',
    colorPrimary: 'green',
    colorSecondary: 'greenBright',
    colorMessage: 'greenBright',
  },
  TRACE: {
    icon: '➥',
    colorPrimary: 'magentaBright',
    colorSecondary: 'magentaBright',
    colorMessage: 'white',
  },
  TRACK: {
    icon: '➥',
    colorPrimary: 'magenta',
    colorSecondary: 'magenta',
    colorMessage: 'white',
  },
  DEBUG: {
    icon: '➥',
    colorPrimary: 'cyan',
    colorSecondary: 'cyanBright',
    colorMessage: 'cyanBright',
  },
  VERBOSE: {
    icon: '➥',
    colorPrimary: 'gray',
    colorSecondary: 'gray',
    colorMessage: 'gray',
  },
};
