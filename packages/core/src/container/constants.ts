import { Id } from './id';

export const DECORATOR_METADATA_KEYS = {
  MODULE_OPTIONS: Symbol('module(OPTIONS)'),
  PROVIDER_EVENTS: Symbol('provider(EVENTS)'),
  PROVIDER_OPTIONS: Symbol('provider(OPTIONS)'),
  EXTENSION_KEY: Symbol('extension(KEY)'),
  EXTENSION_OPTIONS: Symbol('extension(OPTIONS)'),
  COMPONENT_FIELDS: Symbol('component(FIELDS)'),
  COMPONENT_KEYS: Symbol('component(KEYS)'),
  COMPONENT_METHODS: Symbol('component(METHODS)'),
  COMPONENT_OPTIONS: Symbol('component(OPTIONS)'),
};

export const GLOBAL_SCOPE_ID = new Id('GLOBAL_SCOPE_ID');

export const REQUEST_ID = new Id('REQUEST_ID');

export const MODULE_ID = new Id('MODULE_ID');

export const ROOT_MODULE_ID = new Id('ROOT_MODULE_ID');

export const PARENT_MODULE_IDS = new Id('PARENT_MODULE_IDS');
