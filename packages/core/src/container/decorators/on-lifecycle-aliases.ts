import type { OnLifecycleHandler } from './on-lifecycle';
import { OnLifecycle } from './on-lifecycle';

export const OnResolve = <THandler extends OnLifecycleHandler>() =>
  OnLifecycle<THandler>('onResolve');

export const OnInit = <THandler extends OnLifecycleHandler>() =>
  OnLifecycle<THandler>('onInit');

export const OnBoot = <THandler extends OnLifecycleHandler>() =>
  OnLifecycle<THandler>('onBoot');

export const OnDestroy = <THandler extends OnLifecycleHandler>() =>
  OnLifecycle<THandler>('onDestroy');
