import { defineTestFactory, mockClass } from '@bunito/testing';
import { ConfigModule } from '../config-module';
import { ConfigService } from '../config-service';

defineTestFactory('configService', () => mockClass(ConfigService));

defineTestFactory('ConfigModule', function TestConfigModule() {
  return {
    token: ConfigModule,
    providers: [
      {
        token: ConfigService,
        global: true,
        useValue: this.configService,
      },
    ],
    exports: [ConfigService],
  };
});
