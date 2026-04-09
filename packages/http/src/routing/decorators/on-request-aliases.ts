import type { OnRequestOptionsLike, RoutePath } from '../types';
import { OnRequest } from './on-request';

export const OnGet = (path?: RoutePath, options?: OnRequestOptionsLike<'method'>) =>
  OnRequest(path, options, 'GET');

export const OnPost = (path?: RoutePath, options?: OnRequestOptionsLike<'method'>) =>
  OnRequest(path, options, 'POST');

export const OnPut = (path?: RoutePath, options?: OnRequestOptionsLike<'method'>) =>
  OnRequest(path, options, 'PUT');

export const OnDelete = (path?: RoutePath, options?: OnRequestOptionsLike<'method'>) =>
  OnRequest(path, options, 'DELETE');
