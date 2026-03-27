import type { ModuleOptions } from '@bunito/core';
import { configModule } from '@bunito/core';
import { barConfig } from './bar.config';
import { BarController } from './bar.controller';
import { BarService } from './bar.service';

export const BarModule: ModuleOptions = {
  imports: [configModule],
  providers: [barConfig, BarService],
  controllers: [BarController],
  exports: [BarService],
};
