import { Id } from '@bunito/container';
import type { HTTPMethod } from './types';

export const SERVER_FACTORY_ID = new Id('SERVER_FACTORY_ID');

export const HTTP_METHODS: HTTPMethod[] = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
];
