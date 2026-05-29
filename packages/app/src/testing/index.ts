import './globals';

import { defineTestFactory } from '@bunito/testing';
import { testCreateApp } from './test-create-app';
import { testStartApp } from './test-start-app';

defineTestFactory('createApp', testCreateApp);
defineTestFactory('startApp', testStartApp);
