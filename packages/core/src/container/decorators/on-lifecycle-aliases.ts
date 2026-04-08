import { OnLifecycle } from './on-lifecycle';

export const OnResolve = () => OnLifecycle('onResolve');

export const OnInit = () => OnLifecycle('onInit');

export const OnBoot = () => OnLifecycle('onBoot');

export const OnDestroy = () => OnLifecycle('onDestroy');
