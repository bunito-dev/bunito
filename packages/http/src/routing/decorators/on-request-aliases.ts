import type { RouteRequestOptionsLike } from '../types';
import { OnRequest } from './on-request';

export const Get = (optionsLike?: RouteRequestOptionsLike<'method'>) =>
  OnRequest(optionsLike, 'GET');

export const Post = (optionsLike?: RouteRequestOptionsLike<'method'>) =>
  OnRequest(optionsLike, 'POST');

export const Put = (optionsLike?: RouteRequestOptionsLike<'method'>) =>
  OnRequest(optionsLike, 'PUT');

export const Delete = (optionsLike?: RouteRequestOptionsLike<'method'>) =>
  OnRequest(optionsLike, 'DELETE');
